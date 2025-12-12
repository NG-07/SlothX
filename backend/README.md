# SlothX Backend - Setup & Testing Guide

Your FastAPI backend is now fully functional with two main endpoints for citizen registration and verification.

## Quick Start

### 1. Install Dependencies

```powershell
# From the backend directory
pip install -r requirements.txt
```

### 2. Configure Database

Edit `.env` with your PostgreSQL credentials:

```
DB_NAME=central_identity_db
DB_USER=postgres
DB_PASSWORD=admin          # Your actual password
DB_HOST=localhost
MOCK_BIOMETRICS=true
```

### 3. Set Up Database

Run the setup script to create databases and tables:

```powershell
python setup_db.py
```

Expected output:

```
✓ Created database: central_identity_db
✓ Created database: verify_db
✓ Created table: citizen_registry
✓ Created table: verification_logs
✓ Created table: blockchain_blocks
✓ Created table: citizen_index
```

### 4. Start the Server

```powershell
$env:MOCK_BIOMETRICS = "true"
uvicorn central:app --reload --host 127.0.0.1 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 5. Test the Endpoints

In another terminal, run:

```powershell
python test_endpoints.py
```

You should see:

```
============================================================
TEST SUMMARY
============================================================
Register Citizen: ✓ PASS
Verify Citizen: ✓ PASS
============================================================

All tests passed! ✓
```

---

## API Endpoints

### Endpoint 1: Register Citizen

**POST** `/api/v1/register-citizen`

Register a new citizen with their biometric data.

**Request (Form Data):**

- `full_name` (string): Citizen's full name
- `pan_number` (string): PAN number (must be unique)
- `aadhaar_number` (string): Aadhaar number (hashed in database)
- `id_photo` (file): ID photo image file

**Response:**

```json
{
  "status": "REGISTERED",
  "message": "Citizen added to Central DB with Biometrics"
}
```

**Example (curl):**

```bash
curl -X POST http://127.0.0.1:8000/api/v1/register-citizen \
  -F "full_name=John Doe" \
  -F "pan_number=AAAPJ5055K" \
  -F "aadhaar_number=123412341234" \
  -F "id_photo=@/path/to/photo.jpg"
```

---

### Endpoint 2: Verify Citizen

**POST** `/api/v1/verify-citizen`

Verify a citizen's identity using name, PAN, Aadhaar, and a selfie.

**Request (Form Data):**

- `full_name` (string): Citizen's full name
- `pan_number` (string): PAN number
- `aadhaar_number` (string): Aadhaar number
- `selfie` (file): Selfie/live photo image file

**Response (Success):**

```json
{
  "status": "VERIFIED",
  "citizen_id": "1",
  "name_match_score": 95,
  "biometric_match": true,
  "message": "Citizen identity and biometrics confirmed."
}
```

**Response (Failure - Citizen not found):**

```json
{
  "status": "REJECTED",
  "reason": "Identity not found in Central Registry"
}
```

**Response (Failure - Name mismatch):**

```json
{
  "status": "REJECTED",
  "reason": "Name mismatch. Score: 45/100"
}
```

**Example (curl):**

```bash
curl -X POST http://127.0.0.1:8000/api/v1/verify-citizen \
  -F "full_name=John Doe" \
  -F "pan_number=AAAPJ5055K" \
  -F "aadhaar_number=123412341234" \
  -F "selfie=@/path/to/selfie.jpg"
```

---

## Testing Tools

### 1. Using Python Test Script

The easiest way to test both endpoints:

```powershell
python test_endpoints.py
```

This creates dummy images and tests both registration and verification.

### 2. Using curl (PowerShell)

Register a citizen:

```powershell
curl -X POST http://127.0.0.1:8000/api/v1/register-citizen `
  -F "full_name=Jane Smith" `
  -F "pan_number=AAAPS1234J" `
  -F "aadhaar_number=987654321098" `
  -F "id_photo=@C:\path\to\photo.jpg"
```

Verify a citizen:

```powershell
curl -X POST http://127.0.0.1:8000/api/v1/verify-citizen `
  -F "full_name=Jane Smith" `
  -F "pan_number=AAAPS1234J" `
  -F "aadhaar_number=987654321098" `
  -F "selfie=@C:\path\to\selfie.jpg"
```

### 3. Using Postman

1. Create a new POST request to `http://127.0.0.1:8000/api/v1/register-citizen`
2. Go to "Body" → Select "form-data"
3. Add the fields as shown in the endpoint documentation
4. Select "File" type for the image fields
5. Click "Send"

---

## Configuration

### Environment Variables (`.env`)

```env
# Database Configuration
DB_NAME=central_identity_db          # Primary database name
DB_USER=postgres                     # PostgreSQL user
DB_PASSWORD=admin                    # PostgreSQL password
DB_HOST=localhost                    # PostgreSQL host

# Biometrics Mode
MOCK_BIOMETRICS=true                # Set to 'true' to skip face_recognition library
```

### MOCK_BIOMETRICS Mode

When `MOCK_BIOMETRICS=true`:

- Face detection is bypassed (no need for `face_recognition` library)
- Dummy 128-dimensional face encodings are generated
- All face verification checks automatically pass
- Useful for local testing without complex biometric setup

To use real face recognition later:

1. Install `face_recognition`: `pip install face_recognition`
2. Set `MOCK_BIOMETRICS=false` in `.env`

---

## Database Schema

### central_identity_db

**citizen_registry:**

```sql
CREATE TABLE citizen_registry (
    citizen_id SERIAL PRIMARY KEY,
    full_name TEXT,
    pan_number TEXT UNIQUE,
    aadhaar_number_hash TEXT,
    dob DATE,
    face_encoding_json TEXT
);
```

**verification_logs:**

```sql
CREATE TABLE verification_logs (
    id SERIAL PRIMARY KEY,
    claimed_pan TEXT,
    name_match_score INTEGER,
    biometric_status TEXT,
    final_status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### verify_db

**blockchain_blocks:**

```sql
CREATE TABLE blockchain_blocks (
    block_index INTEGER PRIMARY KEY,
    previous_hash TEXT,
    data TEXT,
    timestamp TEXT,
    nonce INTEGER,
    block_hash TEXT UNIQUE
);
```

**citizen_index:**

```sql
CREATE TABLE citizen_index (
    id SERIAL PRIMARY KEY,
    full_name TEXT,
    aadhaar_number_hash TEXT,
    pan_number TEXT UNIQUE,
    dob DATE,
    gender TEXT,
    phone_number TEXT,
    face_encoding_json TEXT,
    aadhaar_card_path TEXT,
    pan_card_path TEXT,
    latest_block_hash TEXT,
    is_verified BOOLEAN
);
```

---

## Troubleshooting

### Issue: "password authentication failed"

**Solution:** Update the `DB_PASSWORD` in `.env` to match your PostgreSQL password.

### Issue: "database does not exist"

**Solution:** Run `python setup_db.py` to create databases and tables.

### Issue: "Form data requires python-multipart to be installed"

**Solution:** Run `pip install python-multipart`

### Issue: Biometric checks failing

**Solution:** Set `MOCK_BIOMETRICS=true` in `.env` to bypass biometric checks during development.

### Issue: Port 8000 already in use

**Solution:** Use a different port:

```powershell
uvicorn central:app --reload --host 127.0.0.1 --port 8001
```

---

## Files Structure

```
backend/
├── central.py                  # Main FastAPI app with register/verify endpoints
├── verifier.py                 # BiometricEngine class & blockchain-related endpoints
├── blockchain_core.py          # SQLBlockchain implementation
├── requirements.txt            # Python dependencies
├── setup_db.py                 # Database setup script
├── test_endpoints.py           # Endpoint testing script
├── test_client.py              # Basic requests-based test client
├── .env                        # Environment configuration (EDIT THIS)
└── .env.example                # Example environment file
```

---

## Next Steps

1. ✓ Server running on `http://127.0.0.1:8000`
2. ✓ Databases and tables created
3. ✓ Both endpoints tested and working
4. **Optional:** Integrate real face recognition by setting `MOCK_BIOMETRICS=false`
5. **Optional:** Connect the blockchain endpoints in `verifier.py` for immutable records
6. **Optional:** Add authentication/authorization to the endpoints

---

## Support

For issues or questions, check the troubleshooting section above or review the endpoint documentation.
