#!/usr/bin/env python
"""
Setup script to create databases and tables for SlothX backend.
Run this once before starting the server.
"""
import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")

def setup_databases():
    """Create databases and tables."""
    
    # Connect to default postgres DB
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
        )
        cursor = conn.cursor()
        conn.autocommit = True
        
        # Create central_identity_db
        try:
            cursor.execute("CREATE DATABASE central_identity_db")
            print("✓ Created database: central_identity_db")
        except psycopg2.errors.DuplicateDatabase:
            print("✓ Database central_identity_db already exists")
        
        # Create verify_db
        try:
            cursor.execute("CREATE DATABASE verify_db")
            print("✓ Created database: verify_db")
        except psycopg2.errors.DuplicateDatabase:
            print("✓ Database verify_db already exists")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"✗ Error connecting to postgres DB: {e}")
        return False
    
    # Create tables in central_identity_db
    try:
        conn = psycopg2.connect(
            dbname="central_identity_db",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
        )
        cursor = conn.cursor()
        
        # citizen_registry table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS citizen_registry (
                citizen_id SERIAL PRIMARY KEY,
                full_name TEXT,
                pan_number TEXT UNIQUE,
                aadhaar_number_hash TEXT,
                dob DATE,
                face_encoding_json TEXT
            )
        """)
        print("✓ Created table: citizen_registry")
        
        # verification_logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS verification_logs (
                id SERIAL PRIMARY KEY,
                claimed_pan TEXT,
                name_match_score INTEGER,
                biometric_status TEXT,
                final_status TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✓ Created table: verification_logs")
        
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"✗ Error setting up central_identity_db: {e}")
        return False
    
    # Create tables in verify_db
    try:
        conn = psycopg2.connect(
            dbname="verify_db",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
        )
        cursor = conn.cursor()
        
        # blockchain_blocks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS blockchain_blocks (
                block_index INTEGER PRIMARY KEY,
                previous_hash TEXT,
                data TEXT,
                timestamp TEXT,
                nonce INTEGER,
                block_hash TEXT UNIQUE
            )
        """)
        print("✓ Created table: blockchain_blocks")
        
        # citizen_index table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS citizen_index (
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
            )
        """)
        print("✓ Created table: citizen_index")
        
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"✗ Error setting up verify_db: {e}")
        return False
    
    print("\n✓ All databases and tables set up successfully!")
    return True

if __name__ == "__main__":
    print("Setting up SlothX databases and tables...\n")
    setup_databases()
