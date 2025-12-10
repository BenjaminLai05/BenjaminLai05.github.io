"""
Test script to verify the /compare-scans API endpoint
Run with: python test_compare_scans_api.py
"""
import requests
import json
from pathlib import Path
import base64
from PIL import Image
from io import BytesIO

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "test_outputs"
API_URL = "http://localhost:8000"


def test_compare_scans():
    """
    Test the /compare-scans endpoint with real images.
    """
    print("=" * 60)
    print("Testing /compare-scans API Endpoint")
    print("=" * 60)
    
    # Find test images
    public_images = Path(__file__).parent.parent.parent / "public" / "images"
    if not public_images.exists():
        print("❌ No test images found in public/images/")
        return False
    
    image_files = list(public_images.glob("*.jpg")) + list(public_images.glob("*.png"))
    if len(image_files) < 2:
        print("❌ Need at least 2 images, found:", len(image_files))
        return False
    
    fixed_path = image_files[0]
    moving_path = image_files[1]
    
    print(f"\n📸 Using images:")
    print(f"   Fixed: {fixed_path.name}")
    print(f"   Moving: {moving_path.name}")
    
    # Check if API is running
    try:
        response = requests.get(f"{API_URL}/docs", timeout=2)
        print(f"\n✅ API server is running at {API_URL}")
    except requests.exceptions.RequestException:
        print(f"\n❌ API server is not running!")
        print(f"   Please start it with: cd src/api && uvicorn main:app --reload")
        return False
    
    # Prepare files
    print("\n📤 Sending request to /compare-scans...")
    
    with open(fixed_path, 'rb') as f1, open(moving_path, 'rb') as f2:
        files = {
            'fixed_img': (fixed_path.name, f1, 'image/jpeg'),
            'moving_img': (moving_path.name, f2, 'image/jpeg')
        }
        
        data = {
            'registration_type': 'rigid',
            'intensity_threshold': '10.0',
            'return_visualization': 'true'
        }
        
        try:
            response = requests.post(
                f"{API_URL}/compare-scans",
                files=files,
                data=data,
                timeout=60
            )
            
            if response.status_code != 200:
                print(f"\n❌ Error: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
            
            result = response.json()
            
            print("\n✅ Request successful!")
            print("\n" + "=" * 60)
            print("METRICS RESULTS")
            print("=" * 60)
            
            # Display metrics
            metrics = result.get("metrics", {})
            
            if "overall" in metrics:
                print("\n📈 Overall Image Metrics:")
                overall = metrics["overall"]
                print(f"   Mean intensity - Fixed: {overall.get('mean_intensity_fixed', 0):.2f}")
                print(f"   Mean intensity - Registered: {overall.get('mean_intensity_registered', 0):.2f}")
                print(f"   Intensity change: {overall.get('mean_intensity_change', 0):.2f}")
                print(f"   Intensity change %: {overall.get('mean_intensity_change_percent', 0):.2f}%")
                print(f"   Mean absolute difference: {overall.get('mean_absolute_difference', 0):.2f}")
            
            if "pixel_changes" in metrics:
                print("\n🖼️  Pixel Changes:")
                pixel_changes = metrics["pixel_changes"]
                print(f"   Total pixels: {pixel_changes.get('total_pixels', 0):,}")
                print(f"   Changed pixels: {pixel_changes.get('changed_pixels', 0):,}")
                print(f"   Change percentage: {pixel_changes.get('change_percentage', 0):.2f}%")
            
            if "area_change" in metrics:
                print("\n📏 Area Change:")
                area = metrics["area_change"]
                print(f"   Fixed area: {area.get('fixed_area_pixels', 0):,} pixels")
                print(f"   Registered area: {area.get('registered_area_pixels', 0):,} pixels")
                print(f"   Area change: {area.get('area_change_pixels', 0):,} pixels")
                print(f"   Area change %: {area.get('area_change_percent', 0):.2f}%")
            
            # Save visualization if provided
            OUTPUT_DIR.mkdir(exist_ok=True)
            
            if "visualization" in result:
                vis_data = result["visualization"]
                vis_bytes = base64.b64decode(vis_data)
                vis_image = Image.open(BytesIO(vis_bytes))
                vis_path = OUTPUT_DIR / "api_change_visualization.png"
                vis_image.save(vis_path)
                print(f"\n💾 Saved visualization: {vis_path}")
            
            if "registered_image" in result:
                reg_data = result["registered_image"]
                reg_bytes = base64.b64decode(reg_data)
                reg_image = Image.open(BytesIO(reg_bytes))
                reg_path = OUTPUT_DIR / "api_registered_image.png"
                reg_image.save(reg_path)
                print(f"💾 Saved registered image: {reg_path}")
            
            print("\n" + "=" * 60)
            print("✅ API test completed successfully!")
            print("=" * 60)
            
            return True
            
        except requests.exceptions.Timeout:
            print("\n❌ Request timed out (registration may take time)")
            return False
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


def test_with_masks():
    """
    Test /compare-scans with masks (requires YOLO to generate masks first).
    """
    print("\n" + "=" * 60)
    print("Testing /compare-scans with Masks")
    print("=" * 60)
    
    # This would require first calling /scan-with-mask to get masks
    # For now, just show the structure
    print("\n💡 To test with masks:")
    print("   1. Call /scan-with-mask for both images to get masks")
    print("   2. Then call /compare-scans with the masks")
    print("   3. This will compute mask-based metrics")


if __name__ == "__main__":
    success = test_compare_scans()
    if success:
        test_with_masks()
    else:
        print("\n⚠️  Basic test failed, skipping mask test")

