"""
Test script to verify mask conversion functionality
Run with: python test_mask_conversion.py
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from ultralytics import YOLO
from mask_utils import (
    extract_boxes_and_confidences,
    boxes_to_binary_mask,
    boxes_to_confidence_mask
)

# Add parent directory to path
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "yolo12n_3.pt"

def test_mask_conversion(image_path=None):
    """
    Test mask conversion with a sample image or create synthetic test data.
    """
    print("=" * 60)
    print("Testing Mask Conversion Functionality")
    print("=" * 60)
    
    # Load YOLO model
    if not MODEL_PATH.exists():
        print(f"❌ Model not found at {MODEL_PATH}")
        print("   Creating synthetic test data instead...")
        return test_with_synthetic_data()
    
    print(f"✓ Loading model from {MODEL_PATH}")
    model = YOLO(str(MODEL_PATH))
    
    # Use provided image or try to find a test image
    if image_path and Path(image_path).exists():
        test_image_path = image_path
    else:
        # Try to find an image in the public folder
        public_images = Path(__file__).parent.parent.parent / "public" / "images"
        if public_images.exists():
            image_files = list(public_images.glob("*.jpg")) + list(public_images.glob("*.png"))
            if image_files:
                test_image_path = image_files[0]
                print(f"✓ Using test image: {test_image_path}")
            else:
                print("⚠ No test images found, using synthetic data")
                return test_with_synthetic_data()
        else:
            print("⚠ No test images found, using synthetic data")
            return test_with_synthetic_data()
    
    # Load and process image
    print(f"\n📸 Processing image: {test_image_path}")
    pil_image = Image.open(test_image_path).convert("RGB")
    image_array = np.array(pil_image)
    image_shape = image_array.shape[:2]  # (height, width)
    print(f"   Image shape: {image_shape}")
    
    # Run YOLO prediction
    print("\n🔍 Running YOLO prediction...")
    results = model.predict(pil_image, conf=0.5)[0]
    
    # Extract boxes and confidences
    boxes, confidences = extract_boxes_and_confidences(results)
    print(f"   Found {len(boxes)} detections")
    
    if len(boxes) == 0:
        print("⚠ No detections found. Creating synthetic test data...")
        return test_with_synthetic_data()
    
    print(f"   Boxes shape: {boxes.shape}")
    print(f"   Confidences shape: {confidences.shape}")
    print(f"   Confidence range: {confidences.min():.3f} - {confidences.max():.3f}")
    
    # Test binary mask
    print("\n🎭 Creating binary mask...")
    binary_mask = boxes_to_binary_mask(boxes, image_shape, confidences)
    print(f"   Binary mask shape: {binary_mask.shape}")
    print(f"   Binary mask dtype: {binary_mask.dtype}")
    print(f"   Unique values: {np.unique(binary_mask)}")
    print(f"   Mask coverage: {(binary_mask > 0).sum() / binary_mask.size * 100:.2f}%")
    
    # Test confidence mask
    print("\n📊 Creating confidence mask...")
    confidence_mask = boxes_to_confidence_mask(boxes, confidences, image_shape)
    print(f"   Confidence mask shape: {confidence_mask.shape}")
    print(f"   Confidence mask dtype: {confidence_mask.dtype}")
    print(f"   Value range: {confidence_mask.min():.3f} - {confidence_mask.max():.3f}")
    print(f"   Mask coverage: {(confidence_mask > 0).sum() / confidence_mask.size * 100:.2f}%")
    
    # Save test outputs
    output_dir = BASE_DIR / "test_outputs"
    output_dir.mkdir(exist_ok=True)
    
    print("\n💾 Saving test outputs...")
    
    # Save original image
    pil_image.save(output_dir / "original.png")
    print(f"   ✓ Saved: {output_dir / 'original.png'}")
    
    # Save binary mask
    binary_mask_pil = Image.fromarray(binary_mask, mode='L')
    binary_mask_pil.save(output_dir / "binary_mask.png")
    print(f"   ✓ Saved: {output_dir / 'binary_mask.png'}")
    
    # Save confidence mask (convert to 0-255 range)
    confidence_mask_uint8 = (confidence_mask * 255).astype(np.uint8)
    confidence_mask_pil = Image.fromarray(confidence_mask_uint8, mode='L')
    confidence_mask_pil.save(output_dir / "confidence_mask.png")
    print(f"   ✓ Saved: {output_dir / 'confidence_mask.png'}")
    
    # Create overlay visualization
    overlay = image_array.copy()
    mask_overlay = binary_mask > 0
    overlay[mask_overlay] = overlay[mask_overlay] * 0.7 + np.array([255, 0, 0]) * 0.3
    overlay_pil = Image.fromarray(overlay.astype(np.uint8))
    overlay_pil.save(output_dir / "overlay.png")
    print(f"   ✓ Saved: {output_dir / 'overlay.png'}")
    
    print("\n" + "=" * 60)
    print("✅ Mask conversion test completed successfully!")
    print(f"   Check outputs in: {output_dir}")
    print("=" * 60)
    
    return True


def test_with_synthetic_data():
    """
    Test with synthetic bounding boxes when no real detections are available.
    """
    print("\n🧪 Testing with synthetic data...")
    
    # Create a synthetic image
    image_shape = (512, 512)  # (height, width)
    image_array = np.random.randint(0, 255, (*image_shape, 3), dtype=np.uint8)
    
    # Create synthetic bounding boxes
    boxes = np.array([
        [100, 100, 200, 200],  # Box 1
        [300, 150, 400, 250],  # Box 2
        [150, 300, 250, 400],  # Box 3
    ], dtype=np.float32)
    
    confidences = np.array([0.85, 0.92, 0.78], dtype=np.float32)
    
    print(f"   Created {len(boxes)} synthetic boxes")
    print(f"   Image shape: {image_shape}")
    
    # Test binary mask
    print("\n🎭 Creating binary mask...")
    binary_mask = boxes_to_binary_mask(boxes, image_shape, confidences)
    print(f"   Binary mask shape: {binary_mask.shape}")
    print(f"   Unique values: {np.unique(binary_mask)}")
    print(f"   Mask coverage: {(binary_mask > 0).sum() / binary_mask.size * 100:.2f}%")
    
    # Test confidence mask
    print("\n📊 Creating confidence mask...")
    confidence_mask = boxes_to_confidence_mask(boxes, confidences, image_shape)
    print(f"   Confidence mask shape: {confidence_mask.shape}")
    print(f"   Value range: {confidence_mask.min():.3f} - {confidence_mask.max():.3f}")
    print(f"   Mask coverage: {(confidence_mask > 0).sum() / confidence_mask.size * 100:.2f}%")
    
    # Save outputs
    output_dir = BASE_DIR / "test_outputs"
    output_dir.mkdir(exist_ok=True)
    
    print("\n💾 Saving test outputs...")
    
    # Save synthetic image
    image_pil = Image.fromarray(image_array)
    image_pil.save(output_dir / "synthetic_original.png")
    print(f"   ✓ Saved: {output_dir / 'synthetic_original.png'}")
    
    # Save binary mask
    binary_mask_pil = Image.fromarray(binary_mask, mode='L')
    binary_mask_pil.save(output_dir / "synthetic_binary_mask.png")
    print(f"   ✓ Saved: {output_dir / 'synthetic_binary_mask.png'}")
    
    # Save confidence mask
    confidence_mask_uint8 = (confidence_mask * 255).astype(np.uint8)
    confidence_mask_pil = Image.fromarray(confidence_mask_uint8, mode='L')
    confidence_mask_pil.save(output_dir / "synthetic_confidence_mask.png")
    print(f"   ✓ Saved: {output_dir / 'synthetic_confidence_mask.png'}")
    
    # Create overlay
    overlay = image_array.copy()
    mask_overlay = binary_mask > 0
    overlay[mask_overlay] = overlay[mask_overlay] * 0.7 + np.array([255, 0, 0]) * 0.3
    overlay_pil = Image.fromarray(overlay.astype(np.uint8))
    overlay_pil.save(output_dir / "synthetic_overlay.png")
    print(f"   ✓ Saved: {output_dir / 'synthetic_overlay.png'}")
    
    print("\n" + "=" * 60)
    print("✅ Synthetic mask conversion test completed!")
    print(f"   Check outputs in: {output_dir}")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    # Allow passing image path as argument
    image_path = sys.argv[1] if len(sys.argv) > 1 else None
    test_mask_conversion(image_path)

