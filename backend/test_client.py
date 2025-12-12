"""
Small helper script to test the backend endpoints.

Usage (run server first):
  python test_client.py register sample_name PAN123 1234 Aadhaar/sample_id.jpg
  python test_client.py verify PAN123 selfie.jpg

It requires `requests` to be installed (see `requirements.txt`).
"""
import sys
import requests

BASE = "http://127.0.0.1:8000"


def register(full_name, pan, aadhaar, id_photo_path):
    url = f"{BASE}/api/v1/register-citizen"
    files = {"id_photo": open(id_photo_path, "rb")}
    data = {"full_name": full_name, "pan_number": pan, "aadhaar_number": aadhaar}
    r = requests.post(url, data=data, files=files)
    print(r.status_code, r.text)


def verify(full_name, pan, aadhaar, selfie_path):
    url = f"{BASE}/api/v1/verify-citizen"
    files = {"selfie": open(selfie_path, "rb")}
    data = {"full_name": full_name, "pan_number": pan, "aadhaar_number": aadhaar}
    r = requests.post(url, data=data, files=files)
    print(r.status_code, r.text)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: test_client.py [register|verify] args...")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "register":
        # args: full_name pan aadhaar id_photo_path
        register(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    elif cmd == "verify":
        # args: full_name pan aadhaar selfie_path
        verify(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    else:
        print("Unknown command")