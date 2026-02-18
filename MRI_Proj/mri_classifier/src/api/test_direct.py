"""Direct test to see the actual error"""
import sys
from pathlib import Path

# Add API directory to path
api_dir = Path(__file__).parent
sys.path.insert(0, str(api_dir))

try:
    print("Importing modules...")
    from mask_utils import extract_boxes_and_confidences
    from PIL import Image
    from ultralytics import YOLO
    import numpy as np
    
    print("✓ All imports successful")
    
    # Load model
    print("Loading YOLO model...")
    MODEL_PATH = api_dir / "yolo12n_3.pt"
    model = YOLO(str(MODEL_PATH))
    print("✓ Model loaded")
    
    # Test detection
    print("Testing detection on sample image...")
    test_image = api_dir.parent.parent / "public" / "images" / "Y1.jpg"
    pil_image = Image.open(test_image).convert("RGB")
    
    results = model.predict(pil_image, conf=0.5)[0]
    boxes, confidences = extract_boxes_and_confidences(results)
    
    print(f"✓ Detection successful: {len(boxes)} tumors detected")
    
    # Test area calculation
    image_area = pil_image.size[0] * pil_image.size[1]
    for idx, (box, conf) in enumerate(zip(boxes, confidences)):
        x1, y1, x2, y2 = box
        width = x2 - x1
        height = y2 - y1
        area = width * height
        area_percent = (area / image_area) * 100
        print(f"  Tumor {idx+1}: {width:.1f}x{height:.1f}px, {area_percent:.2f}%, conf={conf:.2f}")
    
    print("\n✅ All tests passed!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
