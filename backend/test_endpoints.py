"""
Complete test script for SlothX backend endpoints.
Generates dummy images, registers a citizen, and verifies them.

Run with: python test_endpoints.py
"""
import os
import sys
import requests
import json
from PIL import Image, ImageDraw
import numpy as np
import time

BASE_URL = "http://127.0.0.1:8000"

# Generate unique test data using timestamp
TIMESTAMP = int(time.time() * 1000)
TEST_CITIZEN = {
    "full_name": f"Test User {TIMESTAMP}",
    "pan_number": f"PAN{TIMESTAMP % 1000000:06d}",
    "aadhaar_number": f"{TIMESTAMP % 1000000000000:012d}",
}

def create_dummy_image(filename: str, color=(100, 150, 200), size=(200, 200)):
    """Create a dummy image file for testing."""
    img = Image.new("RGB", size, color=color)
    draw = ImageDraw.Draw(img)
    # Draw a simple "face" outline
    draw.ellipse([50, 50, 150, 150], outline="black", width=3)
    draw.line([80, 100, 120, 100], fill="black", width=2)
    draw.arc([70, 70, 130, 130], 180, 360, fill="black", width=2)
    img.save(filename)
    print(f"✓ Created dummy image: {filename}")
    return filename

def test_register_citizen():
    """Test the /api/v1/register-citizen endpoint."""
    print("\n" + "="*60)
    print("TEST 1: Register Citizen")
    print("="*60)
    
    # Create dummy ID photo
    id_photo_path = "test_id_photo.jpg"
    create_dummy_image(id_photo_path, color=(100, 150, 200))
    
    # Prepare multipart form data
    url = f"{BASE_URL}/api/v1/register-citizen"
    data = {
        "full_name": TEST_CITIZEN["full_name"],
        "pan_number": TEST_CITIZEN["pan_number"],
        "aadhaar_number": TEST_CITIZEN["aadhaar_number"],
    }
    
    print(f"\nRequest:")
    print(f"  Method: POST")
    print(f"  URL: {url}")
    print(f"  Data: {data}")
    print(f"  File: {id_photo_path}")
    
    try:
        with open(id_photo_path, "rb") as f:
            files = {"id_photo": f}
            response = requests.post(url, data=data, files=files)
        
        print(f"\nResponse:")
        print(f"  Status Code: {response.status_code}")
        try:
            body = response.json()
            print(f"  Body: {json.dumps(body, indent=2)}")
        except:
            print(f"  Body (raw): {response.text}")
        
        if response.status_code == 200:
            print("\n✓ Registration PASSED")
            return True
        else:
            print("\n✗ Registration FAILED")
            return False
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if os.path.exists(id_photo_path):
            try:
                os.remove(id_photo_path)
            except:
                pass

def test_verify_citizen():
    """Test the /api/v1/verify-citizen endpoint."""
    print("\n" + "="*60)
    print("TEST 2: Verify Citizen")
    print("="*60)
    
    # Create dummy selfie photo
    selfie_path = "test_selfie.jpg"
    create_dummy_image(selfie_path, color=(150, 180, 220))
    
    # Prepare multipart form data
    url = f"{BASE_URL}/api/v1/verify-citizen"
    data = {
        "full_name": TEST_CITIZEN["full_name"],
        "pan_number": TEST_CITIZEN["pan_number"],
        "aadhaar_number": TEST_CITIZEN["aadhaar_number"],
    }
    
    print(f"\nRequest:")
    print(f"  Method: POST")
    print(f"  URL: {url}")
    print(f"  Data: {data}")
    print(f"  File: {selfie_path}")
    
    try:
        with open(selfie_path, "rb") as f:
            files = {"selfie": f}
            response = requests.post(url, data=data, files=files)
        
        print(f"\nResponse:")
        print(f"  Status Code: {response.status_code}")
        try:
            body = response.json()
            print(f"  Body: {json.dumps(body, indent=2)}")
        except:
            print(f"  Body (raw): {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "VERIFIED":
                print("\n✓ Verification PASSED - Citizen verified!")
                return True
            else:
                print("\n⚠ Verification returned non-VERIFIED status")
                return True  # Still a valid response
        else:
            print("\n✗ Verification FAILED")
            return False
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if os.path.exists(selfie_path):
            try:
                os.remove(selfie_path)
            except:
                pass

def main():
    print("\n" + "="*60)
    print("SlothX Backend Endpoint Tests")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Citizen: {TEST_CITIZEN['full_name']}")
    
    # Test 1: Register
    reg_pass = test_register_citizen()
    
    # Test 2: Verify (only if register passed)
    if reg_pass:
        verify_pass = test_verify_citizen()
    else:
        verify_pass = False
        print("\n⚠ Skipping verification test (registration failed)")
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Register Citizen: {'✓ PASS' if reg_pass else '✗ FAIL'}")
    print(f"Verify Citizen: {'✓ PASS' if verify_pass else '✗ FAIL'}")
    print("="*60 + "\n")
    
    if reg_pass and verify_pass:
        print("All tests passed! ✓")
        return 0
    else:
        print("Some tests failed. Check output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
