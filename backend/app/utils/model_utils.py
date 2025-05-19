import torch
import torchvision.transforms as transforms
from PIL import Image
import timm
import os
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Constants
MODEL_PATH = os.environ.get("MODEL_PATH", "models/flower_classifier.pth")
CLASS_NAMES_PATH = os.environ.get("CLASS_NAMES_PATH", "models/class_names.json")
MODEL_NAME = "efficientnetv2_rw_s"  # EfficientNetV2 Small variant
IMAGE_SIZE = 384
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    """
    Load the pre-trained EfficientNetV2 model for flower classification.
    Returns both the model and the class names mapping.
    """
    try:
        # Create model architecture
        model = timm.create_model(MODEL_NAME, pretrained=False, num_classes=102)  # 102 classes for Oxford Flowers
        
        # Check if model file exists
        model_path = Path(MODEL_PATH)
        if not model_path.exists():
            logger.warning(f"Model file not found at {MODEL_PATH}. Using placeholder model.")
            # Return a placeholder model for development
            return model, get_placeholder_class_names()
        
        # Load model weights
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        model.to(DEVICE)
        model.eval()
        
        # Load class names
        class_names_path = Path(CLASS_NAMES_PATH)
        if class_names_path.exists():
            with open(class_names_path, 'r') as f:
                class_names = json.load(f)
        else:
            logger.warning(f"Class names file not found at {CLASS_NAMES_PATH}. Using placeholder names.")
            class_names = get_placeholder_class_names()
        
        return model, class_names
    
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        # Return a placeholder model and class names for development
        model = timm.create_model(MODEL_NAME, pretrained=False, num_classes=102)
        return model, get_placeholder_class_names()

def preprocess_image(image: Image.Image):
    """
    Preprocess an image for the flower classification model.
    """
    # Define transformations
    transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    # Apply transformations
    img_tensor = transform(image)
    img_tensor = img_tensor.unsqueeze(0)  # Add batch dimension
    return img_tensor

def predict_flower(model, image_tensor, class_names):
    """
    Make a prediction for a preprocessed image tensor.
    Returns the predicted species and confidence score.
    """
    with torch.no_grad():
        image_tensor = image_tensor.to(DEVICE)
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        
        # Get the highest probability and its index
        confidence, index = torch.max(probabilities, dim=1)
        
        # Get the class name
        predicted_class_idx = index.item()
        species = class_names[str(predicted_class_idx)] if str(predicted_class_idx) in class_names else f"Unknown (Class {predicted_class_idx})"
        
        return {
            "species": species,
            "confidence": float(confidence.item())
        }

def get_placeholder_class_names():
    """
    Return placeholder class names for development.
    In a real project, these would come from training data or a separate file.
    """
    return {
        "0": "Pink Rose",
        "1": "Yellow Sunflower",
        "2": "Red Tulip",
        "3": "White Lily", 
        "4": "Purple Orchid",
        "5": "Orange Marigold",
        "6": "Blue Hydrangea",
        "7": "White Daisy",
        "8": "Red Poppy",
        "9": "Yellow Daffodil"
    }