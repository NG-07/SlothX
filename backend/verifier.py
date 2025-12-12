from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import psycopg2
import face_recognition
import numpy as np
import json
import hashlib
from blockchain_core import SQLBlockchain   # your blockchain engine

app = FastAPI()

# ------------------------------
# DATABASE CONNECTION
# ------------------------------
def get_db():
    return psycopg2.connect(
        dbname="sovereign_db",
        user="postgres",
        password="password",
        host="localhost"
    )

# -------------------------------------------------------------
#  REGISTER CITIZEN + STORE ON BLOCKCHAIN + INSERT INTO INDEX
# -------------------------------------------------------------
@app.post("/api/v1/register-citizen-on-chain")
async def register_citizen(
    full_name: str = Form(...),
    pan_number: str = Form(...),
    aadhaar_number: str = Form(...),
    dob: str = Form(...),
    gender: str = Form(...),
    phone_number: str = Form(...),
    aadhaar_card_path: str = Form(...),
    pan_card_path: str = Form(...),
    id_photo: UploadFile = File(...)
):

    # 1. Process Biometrics
    image = face_recognition.load_image_file(id_photo.file)
    try:
        encoding = face_recognition.face_encodings(image)[0].tolist()
    except Exception:
        raise HTTPException(400, "No face found in ID photo.")

    # 2. Prepare Data for BLOCKCHAIN ONLY (Minimal & Hashed)
    aadhaar_hash = hashlib.sha256(aadhaar_number.encode()).hexdigest()

    citizen_data = {
        "full_name": full_name,
        "pan": pan_number,
        "aadhaar_hash": aadhaar_hash,
        "face_encoding": encoding,
        "verification_status": "VERIFIED_ORIGINAL"
    }

    conn = get_db()
    try:
        cursor = conn.cursor()
        bc = SQLBlockchain(conn)

        # 3. Mine the Block
        new_block = bc.mine_block(citizen_data)

        # 4. Insert into Blockchain Ledger
        cursor.execute("""
            INSERT INTO blockchain_blocks 
            (block_index, previous_hash, data, timestamp, nonce, block_hash)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            new_block['index'],
            new_block['previous_hash'],
            json.dumps(new_block['data']),
            new_block['timestamp'],
            new_block['nonce'],
            new_block['block_hash']
        ))

        # 5. Insert into Citizen Index Table
        cursor.execute("""
            INSERT INTO citizen_index (
                full_name,
                aadhaar_number_hash,
                pan_number,
                dob,
                gender,
                phone_number,
                face_encoding_json,
                aadhaar_card_path,
                pan_card_path,
                latest_block_hash,
                is_verified
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,TRUE)
        """, (
            full_name,
            aadhaar_hash,
            pan_number,
            dob,
            gender,
            phone_number,
            json.dumps(encoding),
            aadhaar_card_path,
            pan_card_path,
            new_block['block_hash']
        ))

        conn.commit()

        return {
            "status": "SUCCESS",
            "block_hash": new_block['block_hash'],
            "msg": "Citizen successfully mined to blockchain."
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(500, str(e))

    finally:
        conn.close()


# --------------------------------------------------------------------
# VERIFY CITIZEN → FACE MATCH + BLOCKCHAIN INTEGRITY CHECK
# --------------------------------------------------------------------
@app.post("/api/v1/verify-with-integrity-check")
async def verify_citizen(
    pan_number: str = Form(...),
    live_selfie: UploadFile = File(...)
):
    conn = get_db()
    cursor = conn.cursor()

    # 1. Fetch citizen’s latest block hash
    cursor.execute("""
        SELECT latest_block_hash, face_encoding_json
        FROM citizen_index
        WHERE pan_number = %s
    """, (pan_number,))
    result = cursor.fetchone()

    if not result:
        return {"status": "FAILED", "reason": "Citizen not found in index."}

    latest_block_hash, stored_face_json = result

    # 2. Fetch corresponding block from blockchain
    cursor.execute("""
        SELECT block_index, previous_hash, data, timestamp, nonce, block_hash 
        FROM blockchain_blocks 
        WHERE block_hash = %s
    """, (latest_block_hash,))
    block_row = cursor.fetchone()

    if not block_row:
        return {"status": "FAILED", "reason": "Blockchain record missing."}

    block_index, prev_hash, block_data, timestamp, nonce, block_hash = block_row
    block_data = json.loads(block_data)

    # 3. Recalculate block hash → check tampering
    bc = SQLBlockchain(conn)
    recalc_hash = bc.calculate_hash(
        index=block_index,
        previous_hash=prev_hash,
        timestamp=str(timestamp),
        data=block_data,
        nonce=nonce
    )

    integrity = "PASSED" if recalc_hash == block_hash else "FAILED"

    # 4. Biometric Face Matching
    live_image = face_recognition.load_image_file(live_selfie.file)

    try:
        live_encoding = face_recognition.face_encodings(live_image)[0]
    except:
        return {"status": "ERROR", "reason": "No face detected in selfie."}

    match = face_recognition.compare_faces(
        [np.array(json.loads(stored_face_json))],
        live_encoding,
        tolerance=0.5
    )[0]

    if not match:
        return {"status": "REJECTED", "reason": "Face mismatch"}

    return {
        "status": "VERIFIED",
        "integrity_check": integrity,
        "block_hash": block_hash,
        "biometric": "MATCH"
    }
