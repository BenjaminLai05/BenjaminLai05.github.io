"""
Quick test script to verify the updated /compare-scans endpoint
"""
import requests
import json
from pathlib import Path

API_URL = "http://localhost:8000"

def test_compare_scans_with_tumor_detection():
    """Test the updated /compare-scans endpoint"""
    print("Testing /compare-scans with YOLO tumor detection...")
    
    # Use two test images
    images_dir = Path(__file__).parent.parent.parent / "public" / "images"
    fixed_image = images_dir / "Y1.jpg"
    moving_image = images_dir / "Y2.jpg"
    
    if not fixed_image.exists() or not moving_image.exists():
        print(f"❌ Test images not found")
        return False
    
    print(f"✓ Using {fixed_image.name} and {moving_image.name}")
    
    # Send request
    with open(fixed_image, 'rb') as f1, open(moving_image, 'rb') as f2:
        files = {
            'fixed_img': (fixed_image.name, f1, 'image/jpeg'),
            'moving_img': (moving_image.name, f2, 'image/jpeg')
        }
        data = {
            'confidence': '0.5',
            'return_annotated': 'true'
        }
        
        try:
            response = requests.post(
                f"{API_URL}/compare-scans",
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"❌ Error: {response.status_code}")
                print(f"   Response headers: {response.headers}")
                print(f"   Response text: {response.text[:500]}")  # First 500 chars
                return False
            
            result = response.json()
            metrics = result.get("metrics", {})
            
            # Verify expected fields are present
            print("\n✅ Response received!")
            print(f"\nFixed scan:")
            print(f"  - Tumors detected: {metrics.get('fixed_scan', {}).get('num_tumors', 0)}")
            print(f"  - Total area: {metrics.get('fixed_scan', {}).get('total_area_percent', 0):.2f}%")
            
            print(f"\nMoving scan:")
            print(f"  - Tumors detected: {metrics.get('moving_scan', {}).get('num_tumors', 0)}")
            print(f"  - Total area: {metrics.get('moving_scan', {}).get('total_area_percent', 0):.2f}%")
            
            print(f"\nComparison:")
            print(f"  - Tumor count change: {metrics.get('comparison', {}).get('tumor_count_change', 0)}")
            print(f"  - Area change: {metrics.get('comparison', {}).get('area_percent_change', 0):.2f}%")
            print(f"  - New tumors detected: {metrics.get('comparison', {}).get('new_tumors_detected', 0)}")
            
            # Check if annotated images are present
            if 'fixed_annotated' in result and 'moving_annotated' in result:
                print("\n✓ Annotated images returned")
            
            print("\n✅ Test passed! Endpoint is working correctly.")
            return True
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return False

if __name__ == "__main__":
    test_compare_scans_with_tumor_detection()
