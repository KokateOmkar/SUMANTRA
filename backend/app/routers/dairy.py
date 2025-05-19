from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from typing import Optional, List
import logging
import uuid
from datetime import datetime
import json

# Import utilities and schemas
from utils.firebase_utils import save_diary_entry, get_diary_entries, upload_image_to_firebase
from schemas.diary import DiaryEntry, DiaryEntryResponse

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/diary", response_model=DiaryEntryResponse)
async def create_diary_entry(
    user_id: str = Form(...),
    plant_name: str = Form(...),
    notes: str = Form(...),
    flower_species: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """
    Create a new diary entry for a plant.
    """
    try:
        # Generate entry ID
        entry_id = str(uuid.uuid4())
        
        # If image is provided, upload to Firebase Storage
        image_url = None
        if image:
            if not image.content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail="File is not an image")
            
            content = await image.read()
            image_path = f"diary/{user_id}/{entry_id}.jpg"
            image_url = await upload_image_to_firebase(content, image_path)
        
        # Create diary entry
        entry = DiaryEntry(
            id=entry_id,
            user_id=user_id,
            plant_name=plant_name,
            notes=notes,
            flower_species=flower_species,
            image_url=image_url,
            created_at=datetime.now().isoformat()
        )
        
        # Save to Firestore
        await save_diary_entry(entry)
        
        return {
            "success": True,
            "entry_id": entry_id,
            "message": "Diary entry created successfully"
        }
    
    except Exception as e:
        logger.error(f"Error creating diary entry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create diary entry: {str(e)}")

@router.get("/diary/{user_id}", response_model=List[DiaryEntry])
async def get_user_diary_entries(user_id: str):
    """
    Get all diary entries for a specific user.
    """
    try:
        entries = await get_diary_entries(user_id)
        return entries
    
    except Exception as e:
        logger.error(f"Error retrieving diary entries: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve diary entries: {str(e)}")

@router.get("/diary/{user_id}/{entry_id}", response_model=DiaryEntry)
async def get_single_diary_entry(user_id: str, entry_id: str):
    """
    Get a specific diary entry.
    """
    try:
        entries = await get_diary_entries(user_id)
        for entry in entries:
            if entry.id == entry_id:
                return entry
        
        raise HTTPException(status_code=404, detail="Diary entry not found")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving diary entry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve diary entry: {str(e)}")