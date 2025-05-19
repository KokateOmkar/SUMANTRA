from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import io
from PIL import Image
import torch
import numpy as np
import logging
import os
from pathlib import Path
import sys

# Add parent directory to path to import from utils
sys.path.append(str(Path(__file__).parent.parent))

from utils.model_utils import load_model, preprocess_image, predict_flower
from utils.firebase_utils import upload_image_to_firebase
from schemas.prediction import PredictionResponse, HealthStatus

router = APIRouter()
logger = logging.getLogger(__name__)

# Load model (will be loaded when the router is imported)
try:
    model, class_names = load_model()
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    model = None
    class_names = []

@router.post("/predict", response_model=PredictionResponse)
async def predict_flower_image(file: UploadFile = File(...)):
    """
    Predicts flower species from uploaded image, with health status and care tips.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image")
    
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Read and preprocess image
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        processed_image = preprocess_image(image)
        
        # Make prediction
        prediction_result = predict_flower(model, processed_image, class_names)
        
        # Simple health check (placeholder - would be replaced with actual model)
        # For now, we're using a simplistic green color detection approach
        np_image = np.array(image)
        # Check green channel dominance as a very basic plant health indicator
        green_dominance = np.mean(np_image[:,:,1]) > (np.mean(np_image[:,:,0]) * 1.1) and \
                         np.mean(np_image[:,:,1]) > (np.mean(np_image[:,:,2]) * 1.1)
        
        health_status = HealthStatus.HEALTHY if green_dominance else HealthStatus.NEEDS_ATTENTION
        
        # Get care tips based on the predicted flower
        care_tips = get_care_tips(prediction_result["species"])
        
        return {
            "species": prediction_result["species"],
            "confidence": prediction_result["confidence"],
            "health_status": health_status,
            "care_tips": care_tips
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

def get_care_tips(flower_species: str) -> list[str]:
    """
    Returns eco-friendly care tips for the identified flower.
    This is a simple implementation; in a real scenario, this would be a database lookup
    or more sophisticated system.
    """
    # Default tips for any flower
    default_tips = [
        "Water at the base of plants to conserve water and prevent leaf diseases",
        "Use compost instead of chemical fertilizers for more sustainable gardening",
        "Mulch around plants to reduce water evaporation and suppress weeds"
    ]
    
    # Species-specific tips (simplified demonstration)
    species_tips = {
        "rose": [
            "Roses thrive in full sun and well-drained soil",
            "Prune roses in early spring to encourage healthy growth",
            "Apply organic mulch to keep roots cool and retain moisture"
        ],
        "sunflower": [
            "Plant sunflowers in a location with full sun exposure",
            "Support tall varieties with stakes to prevent wind damage",
            "Leave seed heads for birds during fall and winter"
        ],
        "tulip": [
            "Plant tulip bulbs in fall, about 6-8 inches deep",
            "Add compost to soil before planting for better blooms",
            "Allow foliage to yellow and die back naturally after flowering"
        ],
        "lily": [
            "Plant lilies in partial shade in hot climates",
            "Mulch to keep roots cool and moist",
            "Support tall stems to prevent breaking in wind and rain"
        ],
        "daisy": [
            "Daisies prefer full sun but can tolerate partial shade",
            "Deadhead spent flowers to encourage continuous blooming",
            "Divide clumps every 2-3 years to maintain vigor"
        ]
    }
    
    # Check if we have specific tips for this flower
    # Use partial matching to find species
    matched_species = None
    for species in species_tips:
        if species in flower_species.lower():
            matched_species = species
            break
    
    if matched_species:
        return species_tips[matched_species] + default_tips[-1:]
    else:
        return default_tips