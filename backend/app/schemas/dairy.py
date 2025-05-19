
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DiaryEntry(BaseModel):
    id: str
    user_id: str
    plant_name: str
    notes: str
    flower_species: Optional[str] = None
    image_url: Optional[str] = None
    created_at: str

class DiaryEntryResponse(BaseModel):
    success: bool
    entry_id: str
    message: str