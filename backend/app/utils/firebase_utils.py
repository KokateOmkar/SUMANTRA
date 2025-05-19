import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import io
import logging
from dotenv import load_dotenv
from pathlib import Path
import json
import asyncio
from datetime import datetime

# Import schemas
from schemas.diary import DiaryEntry

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Firebase configuration
FIREBASE_CREDENTIALS_PATH = os.environ.get("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
FIREBASE_STORAGE_BUCKET = os.environ.get("FIREBASE_STORAGE_BUCKET", "sumantra-app.appspot.com")

# Initialize Firebase (will be done when this module is imported)
def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            # Check if credentials file exists
            cred_path = Path(FIREBASE_CREDENTIALS_PATH)
            if cred_path.exists():
                cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': FIREBASE_STORAGE_BUCKET
                })
                logger.info("Firebase initialized successfully")
            else:
                logger.warning(f"Firebase credentials file not found at {FIREBASE_CREDENTIALS_PATH}. Using development mode.")
                # For development/testing without actual Firebase
                os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
                firebase_admin.initialize_app()
    except Exception as e:
        logger.error(f"Error initializing Firebase: {str(e)}")
        # Continue without Firebase for development/testing
        logger.warning("Running without Firebase - diary functionality will be limited")

# Initialize Firebase when module is imported
initialize_firebase()

async def upload_image_to_firebase(image_data: bytes, destination_path: str) -> str:
    """
    Upload an image to Firebase Storage and return its public URL.
    For development/testing, returns a placeholder URL.
    """
    try:
        if not firebase_admin._apps:
            # Return placeholder URL for development
            return f"https://storage.googleapis.com/{FIREBASE_STORAGE_BUCKET}/{destination_path}"
        
        # Get bucket
        bucket = storage.bucket()
        
        # Create blob and upload
        blob = bucket.blob(destination_path)
        blob.upload_from_string(image_data, content_type="image/jpeg")
        
        # Make the blob publicly accessible
        blob.make_public()
        
        # Return the public URL
        return blob.public_url
    
    except Exception as e:
        logger.error(f"Error uploading image to Firebase: {str(e)}")
        # Return placeholder URL for development
        return f"https://storage.googleapis.com/{FIREBASE_STORAGE_BUCKET}/{destination_path}"

async def save_diary_entry(entry: DiaryEntry):
    """
    Save a diary entry to Firestore.
    For development/testing, saves to a local JSON file.
    """
    try:
        if not firebase_admin._apps:
            # Save to local JSON file for development
            save_to_local_json(entry)
            return
        
        # Get Firestore client
        db = firestore.client()
        
        # Convert entry to dict
        entry_dict = entry.dict()
        
        # Save to Firestore
        db.collection("diary_entries").document(entry.id).set(entry_dict)
        logger.info(f"Diary entry saved with ID: {entry.id}")
    
    except Exception as e:
        logger.error(f"Error saving diary entry to Firestore: {str(e)}")
        # Save to local JSON file for development
        save_to_local_json(entry)

async def get_diary_entries(user_id: str):
    """
    Get diary entries for a specific user from Firestore.
    For development/testing, reads from a local JSON file.
    """
    try:
        if not firebase_admin._apps:
            # Read from local JSON file for development
            return load_from_local_json(user_id)
        
        # Get Firestore client
        db = firestore.client()
        
        # Query entries
        entries = []
        query = db.collection("diary_entries").where("user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING)
        results = query.get()
        
        # Convert to DiaryEntry objects
        for doc in results:
            entry_data = doc.to_dict()
            entries.append(DiaryEntry(**entry_data))
        
        return entries
    
    except Exception as e:
        logger.error(f"Error getting diary entries from Firestore: {str(e)}")
        # Read from local JSON file for development
        return load_from_local_json(user_id)

# Helper functions for local development (when Firebase is not available)
def save_to_local_json(entry: DiaryEntry):
    """Save diary entry to a local JSON file for development."""
    local_db_path = Path("local_db")
    local_db_path.mkdir(exist_ok=True)
    
    # Convert entry to dict
    entry_dict = {k: v for k, v in entry.dict().items()}
    
    # Read existing entries
    db_file = local_db_path / "diary_entries.json"
    entries = []
    if db_file.exists():
        with open(db_file, 'r') as f:
            try:
                entries = json.load(f)
            except json.JSONDecodeError:
                entries = []
    
    # Add new entry
    entries.append(entry_dict)
    
    # Write back to file
    with open(db_file, 'w') as f:
        json.dump(entries, f, indent=2)
    
    logger.info(f"Diary entry saved locally with ID: {entry.id}")

def load_from_local_json(user_id: str):
    """Load diary entries from a local JSON file for development."""
    local_db_path = Path("local_db")
    db_file = local_db_path / "diary_entries.json"
    
    if not db_file.exists():
        return []
    
    try:
        with open(db_file, 'r') as f:
            entries_data = json.load(f)
        
        # Filter by user_id and convert to DiaryEntry objects
        user_entries = []
        for entry_data in entries_data:
            if entry_data.get("user_id") == user_id:
                user_entries.append(DiaryEntry(**entry_data))
        
        # Sort by created_at descending
        user_entries.sort(key=lambda x: x.created_at, reverse=True)
        return user_entries
    
    except Exception as e:
        logger.error(f"Error loading local diary entries: {str(e)}")
        return []