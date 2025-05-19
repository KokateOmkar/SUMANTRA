# SUMANTRA - AI-Powered Flower Identification and Care System

SUMANTRA is a specialized AI tool for flower enthusiasts, helping identify species, optimize care, and even design gardens.

![SUMANTRA Logo](frontend/assets/logo.png)

## Project Overview

SUMANTRA is a web-based application that allows users to identify flowers, get care tips, and maintain a plant diary. The application uses machine learning to identify flower species from uploaded images and provides personalized gardening advice.

## Features

- **Flower Identification**: Upload images of flowers to identify the species with confidence scores
- **Disease Detection**: Basic detection of plant health issues
- **Eco-friendly Gardening Tips**: Customized care recommendations for identified flowers
- **Plant Diary**: Track your plants with notes and photos
- **Educational Content**: Learn about different flower species and gardening techniques
- **Dark/Light Mode**: User interface adapts to user preferences
- **Responsive Design**: Works on mobile, tablet, and desktop devices

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

## Quick Start

### Backend Setup

1. Navigate to the backend directory
```bash
cd backend
```

2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create the `.env` file with the following content:
```
DEBUG=True
PORT=8000
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
FIREBASE_STORAGE_BUCKET=your-firebase-bucket-name.appspot.com
MODEL_PATH=models/flower_classifier.pth
CLASS_NAMES_PATH=models/class_names.json
```

5. Create the models directory and add placeholder files (for development)
```bash
mkdir -p models
```

6. Start the backend server
```bash
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory
```bash
cd frontend
```

2. Start a local server
```bash
# Using Python's built-in server
python -m http.server 8080

# Or using Node.js http-server if installed
npx http-server -p 8080
```

3. Open your browser and navigate to `http://localhost:8080`

## Development Notes

- The application will work in development mode without actual Firebase credentials, using local storage as a fallback
- For image recognition to work properly in production, you'll need to train and deploy the EfficientNetV2 model

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- EfficientNetV2 model architecture by Google Research
- Oxford Flowers dataset for training data
- FontAwesome for icons
- Unsplash for sample images