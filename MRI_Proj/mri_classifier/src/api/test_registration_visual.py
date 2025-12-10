"""
Visual test for registration - creates side-by-side comparisons
Run with: python test_registration_visual.py
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from registration_utils import register_images, preprocess_for_registration

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "test_outputs"


def create_comparison_image(fixed, moving, registered, labels=True):
    """
    Create a side-by-side comparison image with labels.
    """
    # Ensure all images are same height
    height = fixed.shape[0]
    if moving.shape[0] != height:
        from PIL import Image as PILImage
        moving_pil = PILImage.fromarray(moving.astype(np.uint8), mode='L')
        moving_pil = moving_pil.resize((moving.shape[1], height), PILImage.Resampling.LANCZOS)
        moving = np.array(moving_pil)
    
    if registered.shape[0] != height:
        from PIL import Image as PILImage
        reg_pil = PILImage.fromarray(registered.astype(np.uint8), mode='L')
        reg_pil = reg_pil.resize((registered.shape[1], height), PILImage.Resampling.LANCZOS)
        registered = np.array(reg_pil)
    
    # Stack horizontally
    comparison = np.hstack([fixed, moving, registered])
    
    # Convert to PIL for adding text
    comp_pil = Image.fromarray(comparison.astype(np.uint8), mode='L')
    
    if labels:
        draw = ImageDraw.Draw(comp_pil)
        try:
            # Try to use a nice font, fallback to default
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        except:
            font = ImageFont.load_default()
        
        # Add labels
        w = fixed.shape[1]
        draw.text((w//2 - 50, 20), "Fixed (Reference)", fill=255, font=font, anchor="mm")
        draw.text((w + w//2 - 50, 20), "Moving (Original)", fill=255, font=font, anchor="mm")
        draw.text((2*w + w//2 - 50, 20), "Registered (Aligned)", fill=255, font=font, anchor="mm")
    
    return comp_pil


def test_registration_visual():
    """
    Test registration with visual output.
    """
    print("=" * 60)
    print("Visual Registration Test")
    print("=" * 60)
    
    # Find test images
    public_images = Path(__file__).parent.parent.parent / "public" / "images"
    if not public_images.exists():
        print("⚠ No test images found, using synthetic data...")
        return test_synthetic_visual()
    
    image_files = list(public_images.glob("*.jpg")) + list(public_images.glob("*.png"))
    if len(image_files) < 2:
        print("⚠ Need at least 2 images, using synthetic data...")
        return test_synthetic_visual()
    
    fixed_path = image_files[0]
    moving_path = image_files[1]
    
    print(f"\n📸 Loading images:")
    print(f"   Fixed: {fixed_path.name}")
    print(f"   Moving: {moving_path.name}")
    
    fixed_pil = Image.open(fixed_path).convert("RGB")
    moving_pil = Image.open(moving_path).convert("RGB")
    
    fixed_array = np.array(fixed_pil)
    moving_array = np.array(moving_pil)
    
    print(f"   Fixed size: {fixed_array.shape}")
    print(f"   Moving size: {moving_array.shape}")
    
    # Preprocess
    print("\n🔧 Preprocessing...")
    fixed_processed = preprocess_for_registration(fixed_array)
    
    # Resize moving to match fixed
    from PIL import Image as PILImage
    moving_resized = moving_pil.resize(fixed_pil.size, PILImage.Resampling.LANCZOS)
    moving_processed = preprocess_for_registration(np.array(moving_resized))
    
    print(f"   Processed sizes: {fixed_processed.shape}, {moving_processed.shape}")
    
    # Register
    print("\n🔄 Registering images...")
    try:
        registered, transform = register_images(
            fixed_processed,
            moving_processed,
            registration_type="rigid"
        )
        print("   ✓ Registration successful!")
    except Exception as e:
        print(f"   ❌ Registration failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Create visual comparison
    print("\n🎨 Creating visual comparison...")
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Save individual images
    Image.fromarray(fixed_processed.astype(np.uint8), mode='L').save(
        OUTPUT_DIR / "visual_fixed.png"
    )
    Image.fromarray(moving_processed.astype(np.uint8), mode='L').save(
        OUTPUT_DIR / "visual_moving.png"
    )
    Image.fromarray(registered.astype(np.uint8), mode='L').save(
        OUTPUT_DIR / "visual_registered.png"
    )
    
    # Create labeled comparison
    comparison = create_comparison_image(
        fixed_processed,
        moving_processed,
        registered,
        labels=True
    )
    comparison.save(OUTPUT_DIR / "visual_comparison_labeled.png")
    
    print(f"\n💾 Saved outputs to: {OUTPUT_DIR}")
    print("   - visual_fixed.png")
    print("   - visual_moving.png")
    print("   - visual_registered.png")
    print("   - visual_comparison_labeled.png")
    
    # Calculate alignment quality metrics
    print("\n📊 Alignment Quality Metrics:")
    
    # Calculate difference between fixed and registered
    diff = np.abs(fixed_processed.astype(float) - registered.astype(float))
    mean_diff = np.mean(diff)
    max_diff = np.max(diff)
    
    print(f"   Mean absolute difference: {mean_diff:.2f} (lower is better)")
    print(f"   Max absolute difference: {max_diff:.2f}")
    print(f"   Difference as % of max: {(mean_diff / 255) * 100:.2f}%")
    
    print("\n" + "=" * 60)
    print("✅ Visual registration test completed!")
    print("=" * 60)
    
    return True


def test_synthetic_visual():
    """
    Test with synthetic images that have known transformations.
    """
    print("\n🧪 Creating synthetic test images...")
    
    # Create base image with clear features
    base = np.zeros((512, 512), dtype=np.uint8)
    base[100:200, 100:200] = 255  # White square
    base[300:400, 300:400] = 128  # Gray square
    base[200:250, 200:250] = 200  # Light square
    
    # Create "moving" image with known shift
    from scipy.ndimage import shift, rotate
    moving = shift(base, (30, 40))  # Translate
    moving = rotate(moving, 3, reshape=False)  # Small rotation
    
    print("   Created synthetic images with known transformation")
    print("   (30px vertical shift, 40px horizontal shift, 3° rotation)")
    
    # Register
    print("\n🔄 Registering...")
    try:
        registered, transform = register_images(
            base.astype(np.float32),
            moving.astype(np.float32),
            registration_type="rigid"
        )
        print("   ✓ Registration successful!")
    except Exception as e:
        print(f"   ❌ Registration failed: {e}")
        return False
    
    # Create comparison
    OUTPUT_DIR.mkdir(exist_ok=True)
    comparison = create_comparison_image(base, moving, registered.astype(np.uint8))
    comparison.save(OUTPUT_DIR / "synthetic_comparison.png")
    
    print(f"\n💾 Saved: {OUTPUT_DIR / 'synthetic_comparison.png'}")
    
    print("\n" + "=" * 60)
    print("✅ Synthetic visual test completed!")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    test_registration_visual()

