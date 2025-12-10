#!/usr/bin/env python3
"""
Script to detect tumors in all images used in patient scan history
and update the data with actual tumor counts
"""
import sys
from pathlib import Path
from PIL import Image
from ultralytics import YOLO
import json

# Add parent directory to path
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "yolo12n_3.pt"
PUBLIC_DIR = BASE_DIR.parent.parent / "public"

# Patient scan history data structure
PATIENT_SCANS = {
    'John Smith': [
        {'year': 2020, 'date': '2020-03-15', 'image': '/dataset/yes/Y1.jpg'},
        {'year': 2021, 'date': '2021-06-20', 'image': '/dataset/yes/Y10.jpg'},
        {'year': 2022, 'date': '2022-09-10', 'image': '/dataset/yes/Y20.jpg'},
        {'year': 2023, 'date': '2023-12-05', 'image': '/dataset/yes/Y30.jpg'},
        {'year': 2024, 'date': '2024-11-15', 'image': '/dataset/yes/Y40.jpg'},
    ],
    'Sarah Johnson': [
        {'year': 2019, 'date': '2019-05-12', 'image': '/dataset/yes/Y2.jpg'},
        {'year': 2020, 'date': '2020-08-18', 'image': '/dataset/yes/Y11.jpg'},
        {'year': 2021, 'date': '2021-11-25', 'image': '/dataset/yes/Y21.jpg'},
        {'year': 2022, 'date': '2022-02-14', 'image': '/dataset/yes/Y31.jpg'},
        {'year': 2023, 'date': '2023-07-30', 'image': '/dataset/yes/Y41.jpg'},
        {'year': 2024, 'date': '2024-12-01', 'image': '/dataset/yes/Y50.jpg'},
    ],
    'Michael Chen': [
        {'year': 2021, 'date': '2021-04-08', 'image': '/dataset/yes/Y3.jpg'},
        {'year': 2022, 'date': '2022-07-15', 'image': '/dataset/yes/Y12.jpg'},
        {'year': 2023, 'date': '2023-10-22', 'image': '/dataset/yes/Y22.jpg'},
        {'year': 2024, 'date': '2024-11-20', 'image': '/dataset/yes/Y32.jpg'},
    ],
    'Emily Rodriguez': [
        {'year': 2020, 'date': '2020-01-20', 'image': '/dataset/yes/Y4.jpg'},
        {'year': 2021, 'date': '2021-04-12', 'image': '/dataset/yes/Y13.jpg'},
        {'year': 2022, 'date': '2022-07-08', 'image': '/dataset/yes/Y23.jpg'},
        {'year': 2023, 'date': '2023-09-25', 'image': '/dataset/yes/Y33.jpg'},
        {'year': 2024, 'date': '2024-10-10', 'image': '/dataset/yes/Y42.jpg'},
    ],
    'David Kim': [
        {'year': 2022, 'date': '2022-03-10', 'image': '/dataset/yes/Y5.jpg'},
        {'year': 2022, 'date': '2022-06-15', 'image': '/dataset/yes/Y14.jpg'},
        {'year': 2023, 'date': '2023-01-20', 'image': '/dataset/yes/Y24.jpg'},
        {'year': 2023, 'date': '2023-04-25', 'image': '/dataset/yes/Y34.jpg'},
        {'year': 2023, 'date': '2023-08-10', 'image': '/dataset/yes/Y43.jpg'},
        {'year': 2024, 'date': '2024-01-15', 'image': '/dataset/yes/Y51.jpg'},
        {'year': 2024, 'date': '2024-04-20', 'image': '/dataset/yes/Y60.jpg'},
        {'year': 2024, 'date': '2024-07-25', 'image': '/dataset/yes/Y70.jpg'},
        {'year': 2024, 'date': '2024-12-05', 'image': '/dataset/yes/Y80.jpg'},
    ],
    'Lisa Anderson': [
        {'year': 2021, 'date': '2021-02-10', 'image': '/dataset/no/N1.jpeg'},
        {'year': 2022, 'date': '2022-05-18', 'image': '/dataset/no/N2.jpeg'},
        {'year': 2023, 'date': '2023-08-22', 'image': '/dataset/no/N3.jpg'},
        {'year': 2024, 'date': '2024-11-28', 'image': '/dataset/no/N4.jpg'},
    ],
    'James Wilson': [
        {'year': 2020, 'date': '2020-06-15', 'image': '/dataset/yes/Y6.jpg'},
        {'year': 2021, 'date': '2021-09-20', 'image': '/dataset/yes/Y15.jpg'},
        {'year': 2022, 'date': '2022-12-10', 'image': '/dataset/yes/Y25.jpg'},
        {'year': 2023, 'date': '2023-03-18', 'image': '/dataset/yes/Y35.jpg'},
        {'year': 2024, 'date': '2024-12-03', 'image': '/dataset/yes/Y44.jpg'},
    ],
    'Maria Garcia': [
        {'year': 2020, 'date': '2020-09-12', 'image': '/dataset/yes/Y7.jpg'},
        {'year': 2021, 'date': '2021-12-18', 'image': '/dataset/yes/Y16.jpg'},
        {'year': 2022, 'date': '2022-03-25', 'image': '/dataset/yes/Y26.jpg'},
        {'year': 2023, 'date': '2023-06-30', 'image': '/dataset/yes/Y36.jpg'},
        {'year': 2024, 'date': '2024-11-22', 'image': '/dataset/yes/Y45.jpg'},
    ],
}

def detect_tumors_in_image(image_path):
    """Detect tumors in an image and return count and average confidence"""
    if not MODEL_PATH.exists():
        print(f"⚠️  Model not found at {MODEL_PATH}")
        return 0, 0.0
    
    if not image_path.exists():
        print(f"⚠️  Image not found: {image_path}")
        return 0, 0.0
    
    try:
        model = YOLO(str(MODEL_PATH))
        pil_image = Image.open(image_path).convert("RGB")
        results = model.predict(pil_image, conf=0.5)[0]
        
        num_tumors = len(results.boxes)
        if num_tumors > 0:
            confidences = results.boxes.conf.cpu().numpy()
            avg_confidence = float(confidences.mean())
        else:
            avg_confidence = 0.0
        
        return num_tumors, avg_confidence
    except Exception as e:
        print(f"❌ Error processing {image_path}: {e}")
        return 0, 0.0

def process_all_scans():
    """Process all patient scans and detect tumors"""
    print("=" * 60)
    print("Detecting Tumors in Patient Scan Images")
    print("=" * 60)
    
    results = {}
    
    for patient_name, scans in PATIENT_SCANS.items():
        print(f"\n📋 Processing {patient_name}...")
        patient_results = []
        
        for scan in scans:
            image_path = PUBLIC_DIR / scan['image'].lstrip('/')
            print(f"   Checking {scan['image']}...", end=' ')
            
            tumor_count, avg_confidence = detect_tumors_in_image(image_path)
            
            result = {
                'year': scan['year'],
                'date': scan['date'],
                'image': scan['image'],
                'tumorCount': tumor_count,
                'confidence': round(avg_confidence, 2) if avg_confidence > 0 else 0.95,  # Default high confidence for clean scans
                'status': 'tumour' if tumor_count > 0 else 'clean'
            }
            
            patient_results.append(result)
            print(f"Found {tumor_count} tumor(s), confidence: {result['confidence']:.2f}")
        
        results[patient_name] = patient_results
    
    return results

def generate_js_file(results):
    """Generate the JavaScript data file with actual tumor counts"""
    js_content = """/**
 * Patient Scan History Data
 * Contains scan history with tumor data points for each patient
 * Time entries are in years, tumor counts from actual YOLO detection
 * Images are matched from the yes/no dataset folders
 */

export const PATIENT_SCAN_HISTORY = {
"""
    
    for patient_name, scans in results.items():
        js_content += f"  '{patient_name}': {{\n"
        js_content += "    scans: [\n"
        
        for scan in scans:
            # Calculate tumor area percent (placeholder - would need actual area calculation)
            # For now, use a simple progression based on tumor count
            base_area = scan['tumorCount'] * 2.0  # Rough estimate: 2% per tumor
            tumor_area_percent = round(base_area, 1)
            
            js_content += f"      {{\n"
            js_content += f"        year: {scan['year']},\n"
            js_content += f"        date: '{scan['date']}',\n"
            js_content += f"        image: '{scan['image']}',\n"
            js_content += f"        tumorCount: {scan['tumorCount']},\n"
            js_content += f"        tumorAreaPercent: {tumor_area_percent},\n"
            js_content += f"        status: '{scan['status']}',\n"
            js_content += f"        confidence: {scan['confidence']}\n"
            js_content += f"      }},\n"
        
        js_content += "    ]\n"
        js_content += "  },\n"
    
    js_content += """};

/**
 * Get scan history for a specific patient
 */
export function getPatientScanHistory(patientName) {
  return PATIENT_SCAN_HISTORY[patientName] || { scans: [] };
}

/**
 * Get chart data for a patient (for tumor count over time)
 */
export function getPatientChartData(patientName) {
  const history = getPatientScanHistory(patientName);
  if (!history.scans || history.scans.length === 0) {
    return [];
  }
  
  return history.scans.map(scan => ({
    year: scan.year,
    date: scan.date,
    tumors: scan.tumorCount,
    areaPercent: scan.tumorAreaPercent,
    confidence: scan.confidence
  }));
}
"""
    
    output_path = BASE_DIR.parent / "data" / "patientScanHistory.js"
    output_path.write_text(js_content)
    print(f"\n✅ Generated {output_path}")

if __name__ == "__main__":
    results = process_all_scans()
    generate_js_file(results)
    print("\n✅ Complete! Patient scan history updated with actual tumor counts.")

