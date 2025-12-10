"""
Test script to verify image registration functionality
Run with: python test_registration.py
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from registration_utils import (
    register_images,
    register_and_apply_to_mask,
    preprocess_for_registration
)

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "test_outputs"


def test_registration():
    """
    Test image registration with sample images.
    """
    print("=" * 60)
    print("Testing Image Registration Functionality")
    print("=" * 60)
    
    # Try to find test images
    public_images = Path(__file__).parent.parent.parent / "public" / "images"
    if not public_images.exists():
        print("⚠ No test images found, creating synthetic test...")
        return test_with_synthetic_data()
    
    image_files = list(public_images.glob("*.jpg")) + list(public_images.glob("*.png"))
    if len(image_files) < 2:
        print("⚠ Need at least 2 images for registration test")
        print("   Creating synthetic test instead...")
        return test_with_synthetic_data()
    
    # Use first two images
    fixed_path = image_files[0]
    moving_path = image_files[1]
    
    print(f"\n📸 Loading images...")
    print(f"   Fixed (reference): {fixed_path.name}")
    print(f"   Moving (to align): {moving_path.name}")
    
    fixed_pil = Image.open(fixed_path).convert("RGB")
    moving_pil = Image.open(moving_path).convert("RGB")
    
    fixed_array = np.array(fixed_pil)
    moving_array = np.array(moving_pil)
    
    print(f"   Fixed shape: {fixed_array.shape}")
    print(f"   Moving shape: {moving_array.shape}")
    
    # Preprocess - resize moving to match fixed size
    print("\n🔧 Preprocessing images...")
    fixed_processed = preprocess_for_registration(fixed_array)
    # Resize moving to match fixed size for registration
    from PIL import Image as PILImage
    moving_pil = PILImage.fromarray(moving_array)
    fixed_pil = PILImage.fromarray(fixed_array)
    moving_resized = moving_pil.resize(fixed_pil.size, PILImage.Resampling.LANCZOS)
    moving_processed = preprocess_for_registration(np.array(moving_resized))
    print(f"   Processed shapes: {fixed_processed.shape}, {moving_processed.shape}")
    
    # Test rigid registration
    print("\n🔄 Testing rigid registration...")
    try:
        registered_rigid, transform_rigid = register_images(
            fixed_processed,
            moving_processed,
            registration_type="rigid"
        )
        print(f"   ✓ Rigid registration successful")
        print(f"   Registered shape: {registered_rigid.shape}")
    except Exception as e:
        print(f"   ❌ Rigid registration failed: {e}")
        return False
    
    # Save outputs
    OUTPUT_DIR.mkdir(exist_ok=True)
    print("\n💾 Saving test outputs...")
    
    # Save original images
    fixed_pil.save(OUTPUT_DIR / "registration_fixed.png")
    moving_pil.save(OUTPUT_DIR / "registration_moving.png")
    print(f"   ✓ Saved original images")
    
    # Save registered image
    registered_pil = Image.fromarray(registered_rigid.astype(np.uint8), mode='L')
    registered_pil.save(OUTPUT_DIR / "registration_registered.png")
    print(f"   ✓ Saved registered image")
    
    # Create side-by-side comparison
    comparison = np.hstack([
        fixed_processed,
        moving_processed,
        registered_rigid
    ])
    comparison_pil = Image.fromarray(comparison.astype(np.uint8), mode='L')
    comparison_pil.save(OUTPUT_DIR / "registration_comparison.png")
    print(f"   ✓ Saved comparison (fixed | moving | registered)")
    
    print("\n" + "=" * 60)
    print("✅ Image registration test completed!")
    print(f"   Check outputs in: {OUTPUT_DIR}")
    print("=" * 60)
    
    return True


def test_with_synthetic_data():
    """
    Test with synthetic images that have known transformations.
    """
    print("\n🧪 Testing with synthetic data...")
    
    # Create a base image
    base_image = np.random.randint(50, 200, (512, 512), dtype=np.uint8)
    
    # Add some structure (circles)
    y, x = np.ogrid[:512, :512]
    center1 = (256, 256)
    center2 = (128, 128)
    mask1 = (x - center1[0])**2 + (y - center1[1])**2 <= 50**2
    mask2 = (x - center2[0])**2 + (y - center2[1])**2 <= 30**2
    base_image[mask1] = 255
    base_image[mask2] = 100
    
    # Create "moving" image by translating and rotating
    # (simulate a shifted/rotated scan)
    from scipy.ndimage import rotate, shift
    moving_image = shift(base_image, (20, 30))  # Translate
    moving_image = rotate(moving_image, 5, reshape=False)  # Rotate
    
    print("   Created synthetic images with known transformation")
    print(f"   Base shape: {base_image.shape}")
    print(f"   Moving shape: {moving_image.shape}")
    
    # Test registration
    print("\n🔄 Testing registration...")
    try:
        registered, transform = register_images(
            base_image,
            moving_image,
            registration_type="rigid"
        )
        print(f"   ✓ Registration successful")
        print(f"   Registered shape: {registered.shape}")
    except Exception as e:
        print(f"   ❌ Registration failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Save outputs
    OUTPUT_DIR.mkdir(exist_ok=True)
    print("\n💾 Saving test outputs...")
    
    Image.fromarray(base_image, mode='L').save(OUTPUT_DIR / "synthetic_fixed.png")
    Image.fromarray(moving_image, mode='L').save(OUTPUT_DIR / "synthetic_moving.png")
    Image.fromarray(registered.astype(np.uint8), mode='L').save(OUTPUT_DIR / "synthetic_registered.png")
    
    comparison = np.hstack([base_image, moving_image, registered.astype(np.uint8)])
    Image.fromarray(comparison, mode='L').save(OUTPUT_DIR / "synthetic_comparison.png")
    
    print(f"   ✓ Saved all outputs to {OUTPUT_DIR}")
    
    print("\n" + "=" * 60)
    print("✅ Synthetic registration test completed!")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    test_registration()

