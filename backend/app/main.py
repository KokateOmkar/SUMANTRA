from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import sys
from dotenv import load_dotenv
import logging
from pathlib import Path

# Import routers
from routers import prediction, diary

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Create the FastAPI application
app = FastAPI(
    title="SUMANTRA API",
    description="AI-Powered Flower Identification and Care System",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://sumantra.netlify.app",  # Add your frontend deployment URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prediction.router, prefix="/api", tags=["prediction"])
app.include_router(diary.router, prefix="/api", tags=["diary"])

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"message": "Welcome to SUMANTRA API!", "status": "active"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)