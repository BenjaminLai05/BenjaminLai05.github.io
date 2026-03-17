# src/api/main.py
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from io import BytesIO
from PIL import Image
from ultralytics import YOLO          # pip install ultralytics
from pathlib import Path
import logging
import numpy as np
import sys
from typing import Optional, List
import base64
# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from mask_utils import extract_boxes_and_confidences, boxes_to_binary_mask, boxes_to_confidence_mask
from registration_utils import register_images, register_and_apply_to_mask, preprocess_for_registration
from change_metrics import (
    compute_change_metrics,
    compute_area_change,
    create_change_visualization
)

# Database Imports
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, get_db
import models
import schemas

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MRI-Tumour Scanner")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent      # → src/api/
MODEL_PATH = BASE_DIR / "yolo12n_3.pt"      

model = YOLO(str(MODEL_PATH))                   # load once
# ↑ adjust relative path if best.pt lives elsewhere

log = logging.getLogger("uvicorn")  # reuse Uvicorn logger

# Serve React frontend static files (built by Docker)
BUILD_DIR = Path(__file__).resolve().parents[2] / "build"
has_build_dir = False
try:
    if BUILD_DIR.exists():
        has_build_dir = True
        app.mount("/static", StaticFiles(directory=BUILD_DIR / "static"), name="static")
        # Serve dataset images used in scan history
        if (BUILD_DIR / "dataset").exists():
            app.mount("/dataset", StaticFiles(directory=BUILD_DIR / "dataset"), name="dataset")
except PermissionError:
    log.warning(f"Could not access {BUILD_DIR} due to permissions. Serving API only.")

@app.get("/")
async def root():
    """Serve React frontend"""
    try:
        index = BUILD_DIR / "index.html"
        if has_build_dir and index.exists():
            return FileResponse(str(index))
    except PermissionError:
        pass
        
    return {
        "message": "MRI Tumor Scanner API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "service": "MRI Tumor Scanner API"}

# ── API ROUTES FOR DATABASE ──────────────────────────────────────────

@app.get("/api/patients", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(models.Patient).offset(skip).limit(limit).all()
    # Add initial mock data if database is empty to aid in prototyping
    if not patients:
        import random
        # Fake patients payload
        mock_data = [
            {
                "patient": models.Patient(id="P93284", name="Sarah Jenkins", age="42", gender="Female", status="Pending Review", statusColor="#f97316", clinicalNotes="Patient presented with mild headaches. First baseline scan complete.", lastScan="15 Oct 2023"),
                "scans": [
                    models.ScanHistory(id="s1", patient_id="P93284", date="15 Oct 2023", tumorCount=1, modelConfidence=0.89, url="/dataset/yes/Y1.jpg")
                ]
            },
            {
                "patient": models.Patient(id="P11029", name="Michael Chang", age="58", gender="Male", status="Cleared", statusColor="var(--success)", clinicalNotes="Routine annual scan. No previous history of neurological issues.", lastScan="12 Nov 2023"),
                "scans": [
                    models.ScanHistory(id="s2", patient_id="P11029", date="12 Nov 2023", tumorCount=0, modelConfidence=0.99, url="/dataset/no/N1.jpeg")
                ]
            },
            {
                "patient": models.Patient(id="P55812", name="Emily Thorne", age="31", gender="Female", status="Scheduled", statusColor="var(--primary)", clinicalNotes="Follow-up requested after recent concussive incident. Monitoring for micro-hemorrhaging.", lastScan="N/A"),
                "scans": []
            },
            {
                "patient": models.Patient(id="P40991", name="Robert Fischer", age="66", gender="Male", status="Pending Review", statusColor="#f97316", clinicalNotes="History of meningioma. Scan requested to check for recurrence.", lastScan="02 Jan 2024"),
                "scans": [
                    models.ScanHistory(id="s3", patient_id="P40991", date="02 Jan 2024", tumorCount=1, modelConfidence=0.92, url="/dataset/yes/Y2.jpg"),
                    models.ScanHistory(id="s4", patient_id="P40991", date="05 Jun 2023", tumorCount=0, modelConfidence=0.95, url="/dataset/no/N2.jpeg")
                ]
            },
            {
                "patient": models.Patient(id="P77302", name="Aisha Reynolds", age="25", gender="Female", status="Cleared", statusColor="var(--success)", clinicalNotes="Presented with migraines. MRI shows no abnormalities.", lastScan="28 Feb 2024"),
                "scans": [
                    models.ScanHistory(id="s5", patient_id="P77302", date="28 Feb 2024", tumorCount=0, modelConfidence=0.98, url="/dataset/no/N3.jpeg")
                ]
            }
        ]

        for item in mock_data:
            db.add(item["patient"])
            for scan in item["scans"]:
                db.add(scan)
                
        db.commit()
        patients = db.query(models.Patient).offset(skip).limit(limit).all()
    return patients

@app.post("/api/patients", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.put("/api/patients/{patient_id}", response_model=schemas.Patient)
def update_patient(patient_id: str, patient_update: schemas.PatientUpdate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = patient_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_patient, key, value)
        
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.post("/api/patients/{patient_id}/scans", response_model=schemas.ScanHistory)
def create_scan_for_patient(patient_id: str, scan: schemas.ScanHistoryCreate, db: Session = Depends(get_db)):
    db_scan = models.ScanHistory(**scan.model_dump(), patient_id=patient_id)
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan

# ── END API ROUTES ───────────────────────────────────────────────────

@app.post("/scan")
async def scan(
    img: UploadFile = File(...),
    confidence: float = Form(0.5)  # default confidence threshold
):
    log.info("▶️  /scan called with %s (%s bytes), confidence=%.2f", 
             img.filename, img.size or "?", confidence)

    raw = await img.read()
    pil = Image.open(BytesIO(raw)).convert("RGB")
    log.info("   image size %s", pil.size)

    # Pass confidence threshold to YOLO
    results = model.predict(pil, conf=confidence)[0]
    log.info("   found %d detections", len(results.boxes.xyxy))

    annotated = results.plot()  # numpy
    log.info("   annotated array shape %s", annotated.shape)

    buf = BytesIO()
    Image.fromarray(annotated).save(buf, format="PNG")
    buf.seek(0)
    log.info("⬅️  returning %d bytes", buf.getbuffer().nbytes)

    return StreamingResponse(buf, media_type="image/png")


@app.post("/scan-with-mask")
async def scan_with_mask(
    img: UploadFile = File(...),
    confidence: float = Form(0.5),
    mask_type: str = Form("binary")  # "binary" or "confidence"
):
    """
    Scan image and return both annotated image and mask.
    Returns JSON with base64-encoded image and mask.
    """
    log.info("▶️  /scan-with-mask called with %s, confidence=%.2f, mask_type=%s", 
             img.filename, confidence, mask_type)

    raw = await img.read()
    pil = Image.open(BytesIO(raw)).convert("RGB")
    image_array = np.array(pil)
    image_shape = image_array.shape[:2]  # (height, width)
    
    log.info("   image size %s", pil.size)

    # Run YOLO prediction
    results = model.predict(pil, conf=confidence)[0]
    log.info("   found %d detections", len(results.boxes.xyxy))

    # Extract boxes and confidences
    boxes, confidences = extract_boxes_and_confidences(results)
    
    # Generate mask based on type
    if mask_type == "confidence":
        mask = boxes_to_confidence_mask(boxes, confidences, image_shape)
        # Convert to 0-255 range for visualization
        mask_uint8 = (mask * 255).astype(np.uint8)
    else:  # binary
        mask_uint8 = boxes_to_binary_mask(boxes, image_shape, confidences)
    
    log.info("   mask shape %s, unique values: %s", mask_uint8.shape, np.unique(mask_uint8))

    # Create annotated image
    annotated = results.plot()  # numpy array
    
    # Convert both to PIL Images and encode
    annotated_pil = Image.fromarray(annotated)
    mask_pil = Image.fromarray(mask_uint8, mode='L')  # Grayscale
    
    # Save to bytes
    annotated_buf = BytesIO()
    annotated_pil.save(annotated_buf, format="PNG")
    annotated_buf.seek(0)
    
    mask_buf = BytesIO()
    mask_pil.save(mask_buf, format="PNG")
    mask_buf.seek(0)
    
    # Return as JSON with base64 encoding
    import base64
    from fastapi.responses import JSONResponse
    
    return JSONResponse({
        "annotated_image": base64.b64encode(annotated_buf.read()).decode('utf-8'),
        "mask": base64.b64encode(mask_buf.read()).decode('utf-8'),
        "mask_type": mask_type,
        "num_detections": len(boxes),
        "boxes": boxes.tolist() if len(boxes) > 0 else [],
        "confidences": confidences.tolist() if len(confidences) > 0 else []
    })


@app.post("/register-scans")
async def register_scans(
    fixed_img: UploadFile = File(...),
    moving_img: UploadFile = File(...),
    registration_type: str = Form("rigid")  # "rigid" or "affine"
):
    """
    Register (align) two scans so they can be compared.
    Returns the registered moving image aligned to the fixed image.
    """
    log.info("▶️  /register-scans called, type=%s", registration_type)
    
    # Read both images
    fixed_raw = await fixed_img.read()
    moving_raw = await moving_img.read()
    
    fixed_pil = Image.open(BytesIO(fixed_raw)).convert("RGB")
    moving_pil = Image.open(BytesIO(moving_raw)).convert("RGB")
    
    fixed_array = np.array(fixed_pil)
    moving_array = np.array(moving_pil)
    
    log.info("   Fixed image shape: %s", fixed_array.shape)
    log.info("   Moving image shape: %s", moving_array.shape)
    
    # Preprocess images
    fixed_processed = preprocess_for_registration(fixed_array)
    moving_processed = preprocess_for_registration(moving_array)
    
    # Register images
    try:
        registered_image, transform = register_images(
            fixed_processed,
            moving_processed,
            registration_type
        )
        log.info("   Registration successful")
    except Exception as e:
        log.error("   Registration failed: %s", str(e))
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    
    # Convert registered image back to RGB for display
    # (SimpleITK returns grayscale, so we'll create RGB version)
    if len(registered_image.shape) == 2:
        registered_rgb = np.stack([registered_image] * 3, axis=2)
    else:
        registered_rgb = registered_image
    
    # Save to buffer
    registered_pil = Image.fromarray(registered_rgb.astype(np.uint8))
    buf = BytesIO()
    registered_pil.save(buf, format="PNG")
    buf.seek(0)
    
    log.info("⬅️  returning registered image")
    
    return StreamingResponse(buf, media_type="image/png")


@app.post("/compare-scans")
async def compare_scans(
    fixed_img: UploadFile = File(...),
    moving_img: UploadFile = File(...),
    confidence: float = Form(0.5),
    return_annotated: str = Form("false")  # Accept as string to handle 'true'/'false'
):
    """
    Compare two scans using YOLO tumor detection.
    
    This endpoint:
    1. Detects tumors in both fixed and moving images using YOLO
    2. Calculates tumor metrics (count, area, size)
    3. Compares tumors between scans
    4. Optionally returns annotated images with bounding boxes
    """
    try:
        # Convert return_annotated string to boolean
        return_annotated_bool = return_annotated.lower() in ['true', '1', 'yes']
        
        log.info("▶️  /compare-scans called, confidence=%.2f, return_annotated=%s", confidence, return_annotated_bool)
        
        # Read images
        fixed_raw = await fixed_img.read()
        moving_raw = await moving_img.read()
        
        fixed_pil = Image.open(BytesIO(fixed_raw)).convert("RGB")
        moving_pil = Image.open(BytesIO(moving_raw)).convert("RGB")
        
        log.info("   Fixed image size: %s", fixed_pil.size)
        log.info("   Moving image size: %s", moving_pil.size)
        
        # Run YOLO detection on both images
        log.info("   Running YOLO detection on fixed image...")
        fixed_results = model.predict(fixed_pil, conf=confidence)[0]
        fixed_boxes, fixed_confidences = extract_boxes_and_confidences(fixed_results)
        log.info("   Fixed image: %d tumors detected", len(fixed_boxes))
        
        log.info("   Running YOLO detection on moving image...")
        moving_results = model.predict(moving_pil, conf=confidence)[0]
        moving_boxes, moving_confidences = extract_boxes_and_confidences(moving_results)
        log.info("   Moving image: %d tumors detected", len(moving_boxes))
        
        # Calculate tumor metrics for fixed scan
        fixed_image_area = fixed_pil.size[0] * fixed_pil.size[1]
        fixed_tumors = []
        fixed_total_area = 0
        
        for idx, (box, conf) in enumerate(zip(fixed_boxes, fixed_confidences)):
            x1, y1, x2, y2 = box
            width = x2 - x1
            height = y2 - y1
            area = width * height
            fixed_total_area += area
            
            fixed_tumors.append({
                "id": idx + 1,
                "x1": float(x1),
                "y1": float(y1),
                "x2": float(x2),
                "y2": float(y2),
                "width": float(width),
                "height": float(height),
                "area": float(area),
                "area_percent": float((area / fixed_image_area) * 100),
                "confidence": float(conf)
            })
        
        # Calculate tumor metrics for moving scan
        moving_image_area = moving_pil.size[0] * moving_pil.size[1]
        moving_tumors = []
        moving_total_area = 0
        
        for idx, (box, conf) in enumerate(zip(moving_boxes, moving_confidences)):
            x1, y1, x2, y2 = box
            width = x2 - x1
            height = y2 - y1
            area = width * height
            moving_total_area += area
            
            moving_tumors.append({
                "id": idx + 1,
                "x1": float(x1),
                "y1": float(y1),
                "x2": float(x2),
                "y2": float(y2),
                "width": float(width),
                "height": float(height),
                "area": float(area),
                "area_percent": float((area / moving_image_area) * 100),
                "confidence": float(conf)
            })
        
        # Calculate comparison metrics
        tumor_count_change = len(moving_tumors) - len(fixed_tumors)
        new_tumors_detected = max(0, tumor_count_change)
        
        # Calculate area changes (normalized by image size)
        fixed_area_percent = (fixed_total_area / fixed_image_area) * 100 if fixed_image_area > 0 else 0
        moving_area_percent = (moving_total_area / moving_image_area) * 100 if moving_image_area > 0 else 0
        area_percent_change = moving_area_percent - fixed_area_percent
        
        # Identify new tumors (simple heuristic: tumors in moving that exceed fixed count)
        new_tumors = []
        if tumor_count_change > 0:
            new_tumors = moving_tumors[-tumor_count_change:]
        
        # Build response metrics
        metrics = {
            "fixed_scan": {
                "num_tumors": len(fixed_tumors),
                "tumors": fixed_tumors,
                "total_area_pixels": float(fixed_total_area),
                "total_area_percent": float(fixed_area_percent),
                "image_size": {
                    "width": int(fixed_pil.size[0]),
                    "height": int(fixed_pil.size[1])
                }
            },
            "moving_scan": {
                "num_tumors": len(moving_tumors),
                "tumors": moving_tumors,
                "total_area_pixels": float(moving_total_area),
                "total_area_percent": float(moving_area_percent),
                "image_size": {
                    "width": int(moving_pil.size[0]),
                    "height": int(moving_pil.size[1])
                }
            },
            "comparison": {
                "tumor_count_change": int(tumor_count_change),
                "new_tumors_detected": int(new_tumors_detected),
                "new_tumors": new_tumors,
                "area_percent_change": float(area_percent_change),
                "area_growth": bool(area_percent_change > 0),
                "area_shrinkage": bool(area_percent_change < 0)
            }
        }
        
        # Build result
        result = {
            "metrics": metrics,
            "confidence_threshold": confidence
        }
        
        # Add annotated images if requested
        if return_annotated_bool:
            log.info("   Generating annotated images...")
            
            # Generate annotated fixed image
            fixed_annotated = fixed_results.plot()
            fixed_annotated_pil = Image.fromarray(fixed_annotated)
            fixed_buf = BytesIO()
            fixed_annotated_pil.save(fixed_buf, format="PNG")
            fixed_buf.seek(0)
            result["fixed_annotated"] = base64.b64encode(fixed_buf.read()).decode('utf-8')
            
            # Generate annotated moving image
            moving_annotated = moving_results.plot()
            moving_annotated_pil = Image.fromarray(moving_annotated)
            moving_buf = BytesIO()
            moving_annotated_pil.save(moving_buf, format="PNG")
            moving_buf.seek(0)
            result["moving_annotated"] = base64.b64encode(moving_buf.read()).decode('utf-8')
        
        log.info("⬅️  returning comparison results with tumor detection")
        
        return JSONResponse(result)
        
    except Exception as e:
        log.error("❌ Error in /compare-scans: %s", str(e))
        import traceback
        log.error(traceback.format_exc())
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


# ── Catch-all: serve static files or React index.html for client-side routing ─
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve static files from build directory, or fall back to React index.html"""
    try:
        if has_build_dir:
            # First, check if the requested path is an actual file in the build dir
            file_path = BUILD_DIR / full_path
            if file_path.is_file():
                return FileResponse(str(file_path))
            # Otherwise, serve index.html for React client-side routing
            index = BUILD_DIR / "index.html"
            if index.exists():
                return FileResponse(str(index))
    except PermissionError:
        pass
        
    return JSONResponse({"detail": "Frontend not built or not accessible"}, status_code=404)

# Force Uvicorn Reload Fix
