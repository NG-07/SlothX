from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import hashlib
from verifier import BiometricEngine

app = FastAPI()
biometric_engine = BiometricEngine()

# --- Database Connection ---
def get_db_connection():
    conn = psycopg2.connect(
        dbname="central_identity_db", 
        user="postgres", 
        password="password", 
        host="localhost"
    )
    return conn

# --- API Endpoints ---

@app.post("/api/v1/verify-citizen")
async def verify_citizen(
    full_name: str = Form(...),
    pan_number: str = Form(...),
    aadhaar_number: str = Form(...),
    selfie: UploadFile = File(...)
):
    """
    Main Verification Endpoint.
    1. Looks up user by PAN/Aadhaar in Central DB.
    2. Matches Name.
    3. Performs Biometric Face Match (Selfie vs Stored Data).
    """
    
    # 1. Hash Aadhaar for lookup (Security Best Practice)
    aadhaar_hash = hashlib.sha256(aadhaar_number.encode()).hexdigest()
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # 2. Database Lookup
        query = """
            SELECT * FROM citizen_registry 
            WHERE pan_number = %s AND aadhaar_number_hash = %s
        """
        cursor.execute(query, (pan_number, aadhaar_hash))
        citizen = cursor.fetchone()
        
        if not citizen:
            return {"status": "REJECTED", "reason": "Identity not found in Central Registry"}
        
        # 3. Name Verification
        name_score = biometric_engine.verify_name(citizen['full_name'], full_name)
        if name_score < 80: # Threshold for name match
            return {
                "status": "REJECTED", 
                "reason": f"Name mismatch. Score: {name_score}/100"
            }
            
        # 4. Biometric Face Verification
        # specific logic: Match uploaded selfie against the face_encoding stored in DB
        if citizen['face_encoding_json']:
            is_match, distance = biometric_engine.verify_face(
                citizen['face_encoding_json'], 
                selfie.file
            )
            
            if not is_match:
                return {
                    "status": "REJECTED", 
                    "reason": "Biometric Mismatch. Face does not match records."
                }
        else:
            return {"status": "ERROR", "reason": "No biometric data registered for this citizen."}

        # 5. Log the Success
        log_query = """
            INSERT INTO verification_logs 
            (claimed_pan, name_match_score, biometric_status, final_status)
            VALUES (%s, %s, 'PASSED', 'VERIFIED')
        """
        cursor.execute(log_query, (pan_number, name_score))
        conn.commit()

        return {
            "status": "VERIFIED",
            "citizen_id": str(citizen['citizen_id']),
            "name_match_score": name_score,
            "biometric_match": True,
            "message": "Citizen identity and biometrics confirmed."
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# --- Helper Endpoint: Register Citizen (To populate your Central DB) ---
@app.post("/api/v1/register-citizen")
async def register_citizen(
    full_name: str = Form(...),
    pan_number: str = Form(...),
    aadhaar_number: str = Form(...),
    id_photo: UploadFile = File(...) # User uploads their ID photo
):
    """
    This endpoint is for YOU to populate the database.
    It takes the ID photo, encodes the face, and saves it.
    """
    # Generate Face Encoding for storage
    image = face_recognition.load_image_file(id_photo.file)
    try:
        encoding = face_recognition.face_encodings(image)
        encoding_list = encoding.tolist() # Convert to JSON-able list
    except IndexError:
        raise HTTPException(status_code=400, detail="No face detected in ID photo")
    
    aadhaar_hash = hashlib.sha256(aadhaar_number.encode()).hexdigest()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    insert_query = """
        INSERT INTO citizen_registry 
        (full_name, pan_number, aadhaar_number_hash, dob, face_encoding_json)
        VALUES (%s, %s, %s, '2000-01-01', %s)
    """
    cursor.execute(insert_query, (full_name, pan_number, aadhaar_hash, json.dumps(encoding_list)))
    conn.commit()
    conn.close()
    
    return {"status": "REGISTERED", "message": "Citizen added to Central DB with Biometrics"}