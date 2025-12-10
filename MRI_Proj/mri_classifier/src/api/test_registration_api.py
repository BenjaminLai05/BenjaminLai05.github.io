"""
Test the registration API endpoint
Run with: python test_registration_api.py
"""
import requests
import base64
from pathlib import Path
from PIL import Image
import io

BASE_DIR = Path(__file__).resolve().parent
API_URL = "http://127.0.0.1:8000"  # FastAPI default port


def test_registration_endpoint():
    """
    Test the /register-scans endpoint with real images.
    """
    print("=" * 60)
    print("Testing Registration API Endpoint")
    print("=" * 60)
    
    # Find test images
    public_images = Path(__file__).parent.parent.parent / "public" / "images"
    if not public_images.exists():
        print("❌ No test images found in public/images/")
        return False
    
    image_files = list(public_images.glob("*.jpg")) + list(public_images.glob("*.png"))
    if len(image_files) < 2:
        print("❌ Need at least 2 images for registration test")
        return False
    
    fixed_path = image_files[0]
    moving_path = image_files[1]
    
    print(f"\n📸 Using images:")
    print(f"   Fixed (reference): {fixed_path.name}")
    print(f"   Moving (to align): {moving_path.name}")
    
    # Check if API is running
    try:
        response = requests.get(f"{API_URL}/docs", timeout=2)
        print(f"\n✓ API server is running at {API_URL}")
    except requests.exceptions.RequestException:
        print(f"\n❌ API server not running at {API_URL}")
        print("   Please start the FastAPI server first:")
        print("   cd src/api && uvicorn main:app --reload")
        return False
    
    # Prepare files for upload
    print("\n📤 Sending registration request...")
    try:
        with open(fixed_path, 'rb') as f1, open(moving_path, 'rb') as f2:
            files = {
                'fixed_img': (fixed_path.name, f1, 'image/jpeg'),
                'moving_img': (moving_path.name, f2, 'image/jpeg')
            }
            data = {
                'registration_type': 'rigid'
            }
            
            response = requests.post(
                f"{API_URL}/register-scans",
                files=files,
                data=data,
                timeout=60  # Registration can take time
            )
        
        if response.status_code == 200:
            print("✓ Registration successful!")
            
            # Save the registered image
            output_dir = BASE_DIR / "test_outputs"
            output_dir.mkdir(exist_ok=True)
            
            registered_image = Image.open(io.BytesIO(response.content))
            registered_image.save(output_dir / "api_registered.png")
            print(f"   ✓ Saved registered image to: {output_dir / 'api_registered.png'}")
            
            print("\n" + "=" * 60)
            print("✅ API registration test completed successfully!")
            print("=" * 60)
            return True
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    test_registration_endpoint()

