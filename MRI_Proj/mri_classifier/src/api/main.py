# src/api/main.py
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse, JSONResponse
from io import BytesIO
from PIL import Image
from ultralytics import YOLO          # pip install ultralytics
from pathlib import Path
import logging
import numpy as np
import sys
from typing import Optional
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

app = FastAPI(title="MRI-Tumour Scanner")

BASE_DIR = Path(__file__).resolve().parent      # → src/api/
MODEL_PATH = BASE_DIR / "yolo12n_3.pt"      

model = YOLO(str(MODEL_PATH))                   # load once
# ↑ adjust relative path if best.pt lives elsewhere

log = logging.getLogger("uvicorn")  # reuse Uvicorn logger

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
    fixed_mask: Optional[UploadFile] = File(None),
    moving_mask: Optional[UploadFile] = File(None),
    registration_type: str = Form("rigid"),
    intensity_threshold: float = Form(10.0),
    return_visualization: bool = Form(True)
):
    """
    Compare two scans: register them, compute change metrics, and return results.
    
    This endpoint:
    1. Registers (aligns) the moving image to the fixed image
    2. Computes change metrics (intensity, area, pixel differences)
    3. Optionally returns a visualization of changes
    """
    log.info("▶️  /compare-scans called, type=%s, threshold=%.2f", registration_type, intensity_threshold)
    
    # Read images
    fixed_raw = await fixed_img.read()
    moving_raw = await moving_img.read()
    
    fixed_pil = Image.open(BytesIO(fixed_raw)).convert("RGB")
    moving_pil = Image.open(BytesIO(moving_raw)).convert("RGB")
    
    fixed_array = np.array(fixed_pil)
    moving_array = np.array(moving_pil)
    
    log.info("   Fixed image shape: %s", fixed_array.shape)
    log.info("   Moving image shape: %s", moving_array.shape)
    
    # Read masks if provided
    fixed_mask_array = None
    moving_mask_array = None
    registered_mask_array = None
    
    if fixed_mask:
        fixed_mask_raw = await fixed_mask.read()
        fixed_mask_pil = Image.open(BytesIO(fixed_mask_raw)).convert("L")
        fixed_mask_array = np.array(fixed_mask_pil)
        log.info("   Fixed mask provided, shape: %s", fixed_mask_array.shape)
    
    if moving_mask:
        moving_mask_raw = await moving_mask.read()
        moving_mask_pil = Image.open(BytesIO(moving_mask_raw)).convert("L")
        moving_mask_array = np.array(moving_mask_pil)
        log.info("   Moving mask provided, shape: %s", moving_mask_array.shape)
    
    # Preprocess and register
    fixed_processed = preprocess_for_registration(fixed_array)
    
    # Resize moving to match fixed
    from PIL import Image as PILImage
    moving_resized = moving_pil.resize(fixed_pil.size, PILImage.Resampling.LANCZOS)
    moving_processed = preprocess_for_registration(np.array(moving_resized))
    
    # Resize moving mask if provided
    if moving_mask_array is not None:
        moving_mask_resized = Image.fromarray(moving_mask_array, mode='L')
        moving_mask_resized = moving_mask_resized.resize(fixed_pil.size, PILImage.Resampling.LANCZOS)
        moving_mask_array = np.array(moving_mask_resized)
    
    # Register images
    try:
        registered_image, transform = register_images(
            fixed_processed,
            moving_processed,
            registration_type
        )
        log.info("   Registration successful")
        
        # Register masks if provided
        if moving_mask_array is not None:
            registered_image_full, registered_mask_array = register_and_apply_to_mask(
                fixed_processed,
                moving_processed,
                moving_mask_array,
                registration_type
            )
            log.info("   Mask registration successful")
        
    except Exception as e:
        log.error("   Registration failed: %s", str(e))
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    
    # Compute change metrics
    log.info("   Computing change metrics...")
    metrics = compute_change_metrics(
        fixed_processed,
        registered_image,
        fixed_mask_array,
        registered_mask_array,
        intensity_threshold
    )
    
    # Add area change if both masks provided
    if fixed_mask_array is not None and registered_mask_array is not None:
        area_metrics = compute_area_change(fixed_mask_array, registered_mask_array)
        metrics["area_change"] = area_metrics
    
    # Create visualization if requested
    result = {
        "metrics": metrics,
        "registration_type": registration_type
    }
    
    if return_visualization:
        log.info("   Creating change visualization...")
        visualization = create_change_visualization(
            fixed_processed,
            registered_image
        )
        vis_pil = Image.fromarray(visualization)
        vis_buf = BytesIO()
        vis_pil.save(vis_buf, format="PNG")
        vis_buf.seek(0)
        
        result["visualization"] = base64.b64encode(vis_buf.read()).decode('utf-8')
    
    # Also include registered image
    registered_pil = Image.fromarray(registered_image.astype(np.uint8), mode='L')
    reg_buf = BytesIO()
    registered_pil.save(reg_buf, format="PNG")
    reg_buf.seek(0)
    
    result["registered_image"] = base64.b64encode(reg_buf.read()).decode('utf-8')
    
    log.info("⬅️  returning comparison results")
    
    return JSONResponse(result)
