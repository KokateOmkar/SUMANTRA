# SUMANTRA
A specialized AI tool for flower enthusiasts, helping identify species, optimize care, and even design gardens.

# SUMANTRA - AI-Powered Flower Identification and Care System

## Project Overview

SUMANTRA is a web-based application that allows users to identify flowers, get care tips, and maintain a plant diary. The application uses machine learning to identify flower species from uploaded images and provides personalized gardening advice.

## Features

- **Flower Identification**: Upload images of flowers to identify the species with confidence scores
- **Disease Detection**: Basic detection of plant health issues
- **Eco-friendly Gardening Tips**: Customized care recommendations for identified flowers
- **Plant Diary**: Track your plants with notes and photos
- **Educational Content**: Learn about different flower species and gardening techniques

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- PyTorch (for ML models)
- EfficientNetV2 (pre-trained model)

### Frontend
- HTML5/CSS3/JavaScript
- Responsive design
- Dark/Light mode

### Database & Storage
- Firebase Firestore (for user data)
- Firebase Storage (for images)

## Project Structure

```
SUMANTRA/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models/          # ML models
│   │   ├── routers/         # API routes
│   │   ├── schemas/         # Pydantic models
│   │   └── utils/           # Utility functions
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # For containerization
├── frontend/
│   ├── index.html           # Main HTML page
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   ├── assets/              # Images, icons, etc.
│   └── package.json         # Frontend dependencies
└── docs/                    # Documentation files
```

## Getting Started

Detailed setup and installation instructions will be added as the project progresses.

## Development Roadmap

1. Project Setup and Structure
2. Backend Development (FastAPI)
3. Frontend Development
4. ML Model Integration
5. Database and Storage Setup
6. Testing & Debugging
7. Deployment

## Contributing

Guidelines for contributing to this project will be added soon.

## License

This project is licensed under the MIT License - see the LICENSE file for details.