"""
Test script to verify change metrics computation
Run with: python test_change_metrics.py
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from change_metrics import (
    compute_change_metrics,
    compute_area_change,
    compute_dice_coefficient,
    create_change_visualization
)
from mask_utils import boxes_to_binary_mask
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "test_outputs"
MODEL_PATH = BASE_DIR / "yolo12n_3.pt"


def test_change_metrics():
    """
    Test change metrics computation with real images.
    """
    print("=" * 60)
    print("Testing Change Metrics Computation")
    print("=" * 60)
    
    # Find test images
    public_images = Path(__file__).parent.parent.parent / "public" / "images"
    if not public_images.exists():
        print("⚠ No test images found, using synthetic data...")
        return test_synthetic_metrics()
    
    image_files = list(public_images.glob("*.jpg")) + list(public_images.glob("*.png"))
    if len(image_files) < 2:
        print("⚠ Need at least 2 images, using synthetic data...")
        return test_synthetic_metrics()
    
    fixed_path = image_files[0]
    moving_path = image_files[1]
    
    print(f"\n📸 Loading images:")
    print(f"   Fixed: {fixed_path.name}")
    print(f"   Moving: {moving_path.name}")
    
    fixed_pil = Image.open(fixed_path).convert("RGB")
    moving_pil = Image.open(moving_path).convert("RGB")
    
    fixed_array = np.array(fixed_pil)
    moving_array = np.array(moving_pil)
    
    # Resize moving to match fixed
    moving_resized = moving_pil.resize(fixed_pil.size, Image.Resampling.LANCZOS)
    moving_array = np.array(moving_resized)
    
    print(f"   Both images now: {fixed_array.shape}")
    
    # Generate masks using YOLO if model available
    fixed_mask = None
    moving_mask = None
    
    if MODEL_PATH.exists():
        print("\n🔍 Generating masks with YOLO...")
        model = YOLO(str(MODEL_PATH))
        
        # Get masks for fixed image
        fixed_results = model.predict(fixed_pil, conf=0.5)[0]
        if len(fixed_results.boxes) > 0:
            from mask_utils import extract_boxes_and_confidences
            boxes, confs = extract_boxes_and_confidences(fixed_results)
            fixed_mask = boxes_to_binary_mask(boxes, fixed_array.shape[:2], confs)
            print(f"   Fixed mask: {np.sum(fixed_mask > 0)} pixels detected")
        
        # Get masks for moving image
        moving_results = model.predict(moving_resized, conf=0.5)[0]
        if len(moving_results.boxes) > 0:
            boxes, confs = extract_boxes_and_confidences(moving_results)
            moving_mask = boxes_to_binary_mask(boxes, moving_array.shape[:2], confs)
            print(f"   Moving mask: {np.sum(moving_mask > 0)} pixels detected")
    
    # Compute change metrics
    print("\n📊 Computing change metrics...")
    metrics = compute_change_metrics(
        fixed_array,
        moving_array,
        fixed_mask,
        moving_mask,
        intensity_threshold=10.0
    )
    
    # Print metrics
    print("\n" + "=" * 60)
    print("CHANGE METRICS RESULTS")
    print("=" * 60)
    
    print("\n📈 Overall Image Metrics:")
    overall = metrics["overall"]
    print(f"   Mean intensity - Fixed: {overall['mean_intensity_fixed']:.2f}")
    print(f"   Mean intensity - Registered: {overall['mean_intensity_registered']:.2f}")
    print(f"   Intensity change: {overall['mean_intensity_change']:.2f}")
    print(f"   Intensity change %: {overall['mean_intensity_change_percent']:.2f}%")
    print(f"   Mean absolute difference: {overall['mean_absolute_difference']:.2f}")
    print(f"   Max absolute difference: {overall['max_absolute_difference']:.2f}")
    
    print("\n🖼️  Pixel Changes:")
    pixel_changes = metrics["pixel_changes"]
    print(f"   Total pixels: {pixel_changes['total_pixels']:,}")
    print(f"   Changed pixels: {pixel_changes['changed_pixels']:,}")
    print(f"   Change percentage: {pixel_changes['change_percentage']:.2f}%")
    
    if "mask_based" in metrics:
        print("\n🎭 Mask-Based Metrics:")
        mask_metrics = metrics["mask_based"]
        for region, data in mask_metrics.items():
            print(f"   {region}:")
            print(f"     Intensity change: {data.get('intensity_change', 0):.2f}")
            print(f"     Intensity change %: {data.get('intensity_change_percent', 0):.2f}%")
            print(f"     Pixel count: {data.get('pixel_count', 0):,}")
    
    if "area_change" in metrics:
        print("\n📏 Area Change:")
        area = metrics["area_change"]
        print(f"   Fixed area: {area['fixed_area_pixels']:,} pixels")
        print(f"   Registered area: {area['registered_area_pixels']:,} pixels")
        print(f"   Area change: {area['area_change_pixels']:,} pixels")
        print(f"   Area change %: {area['area_change_percent']:.2f}%")
        print(f"   Growth: {area['area_growth']}, Shrinkage: {area['area_shrinkage']}")
    
    if "mask_overlap" in metrics:
        print("\n🔗 Mask Overlap:")
        overlap = metrics["mask_overlap"]
        print(f"   Dice coefficient: {overlap['dice_coefficient']:.3f}")
        print(f"   IoU: {overlap['intersection_over_union']:.3f}")
    
    # Create visualization
    print("\n🎨 Creating change visualization...")
    visualization = create_change_visualization(fixed_array, moving_array)
    
    # Save outputs
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    vis_pil = Image.fromarray(visualization)
    vis_pil.save(OUTPUT_DIR / "change_visualization.png")
    print(f"   ✓ Saved: {OUTPUT_DIR / 'change_visualization.png'}")
    
    if fixed_mask is not None:
        Image.fromarray(fixed_mask, mode='L').save(OUTPUT_DIR / "metrics_fixed_mask.png")
    if moving_mask is not None:
        Image.fromarray(moving_mask, mode='L').save(OUTPUT_DIR / "metrics_moving_mask.png")
    
    print("\n" + "=" * 60)
    print("✅ Change metrics test completed!")
    print(f"   Check outputs in: {OUTPUT_DIR}")
    print("=" * 60)
    
    return True


def test_synthetic_metrics():
    """
    Test with synthetic data.
    """
    print("\n🧪 Testing with synthetic data...")
    
    # Create two synthetic images with known differences
    base = np.random.randint(100, 200, (512, 512), dtype=np.uint8)
    
    # Create "changed" version
    changed = base.copy()
    changed[100:200, 100:200] += 50  # Increase intensity in region
    changed[300:400, 300:400] -= 30  # Decrease intensity in region
    
    # Create synthetic masks
    mask1 = np.zeros((512, 512), dtype=np.uint8)
    mask1[100:200, 100:200] = 255
    
    mask2 = np.zeros((512, 512), dtype=np.uint8)
    mask2[100:200, 100:200] = 255
    mask2[300:400, 300:400] = 255  # Mask2 is larger
    
    print("   Created synthetic images with known changes")
    
    # Compute metrics
    metrics = compute_change_metrics(
        base,
        changed,
        mask1,
        mask2,
        intensity_threshold=10.0
    )
    
    print("\n📊 Synthetic Metrics:")
    print(f"   Intensity change: {metrics['overall']['mean_intensity_change']:.2f}")
    print(f"   Changed pixels: {metrics['pixel_changes']['change_percentage']:.2f}%")
    
    if "area_change" in metrics:
        print(f"   Area change: {metrics['area_change']['area_change_percent']:.2f}%")
    
    # Create visualization
    visualization = create_change_visualization(base, changed)
    OUTPUT_DIR.mkdir(exist_ok=True)
    Image.fromarray(visualization).save(OUTPUT_DIR / "synthetic_change_visualization.png")
    
    print(f"\n💾 Saved: {OUTPUT_DIR / 'synthetic_change_visualization.png'}")
    print("\n✅ Synthetic metrics test completed!")
    
    return True


if __name__ == "__main__":
    test_change_metrics()

