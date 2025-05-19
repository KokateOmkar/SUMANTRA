# Deployment Guide for SUMANTRA

This document provides instructions for deploying the SUMANTRA application in both development and production environments.

## Prerequisites

- Python 3.9+
- Node.js and npm (for frontend tools if needed)
- Docker (optional, for containerized deployment)
- Firebase account (for storage and database)

## Backend Deployment

### Development Environment

1. **Setup virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   - Create a `.env` file in the `backend` directory with the following variables:
     ```
     DEBUG=True
     PORT=8000
     FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
     FIREBASE_STORAGE_BUCKET=your-firebase-bucket-name.appspot.com
     MODEL_PATH=models/flower_classifier.pth
     CLASS_NAMES_PATH=models/class_names.json
     ```

4. **Firebase setup**:
   - Create a Firebase project at https://console.firebase.google.com/
   - Generate a service account key (Project Settings → Service Accounts → Generate New Private Key)
   - Save the JSON file as `firebase-credentials.json` in the backend directory

5. **Start the development server**:
   ```bash
   cd app
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Production Deployment with Docker

1. **Build the Docker image**:
   ```bash
   cd backend
   docker build -t sumantra-backend .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 8000:8000 --name sumantra-api \
     -v /path/to/models:/app/models \
     -v /path/to/firebase-credentials.json:/app/firebase-credentials.json \
     -e FIREBASE_STORAGE_BUCKET=your-firebase-bucket-name.appspot.com \
     sumantra-backend
   ```

3. **Alternative: Deploy to Cloud Run**:
   ```bash
   # Build the image for Cloud Run
   gcloud builds submit --tag gcr.io/your-project/sumantra-backend
   
   # Deploy to Cloud Run
   gcloud run deploy sumantra-api \
     --image gcr.io/your-project/sumantra-backend \
     --platform managed \
     --allow-unauthenticated
   ```

## Frontend Deployment

### Development Environment

1. **Start a local server**:
   ```bash
   # Using Python's built-in server
   cd frontend
   python -m http.server 8080
   
   # Or using Node.js http-server if installed
   npx http-server -p 8080
   ```

2. **Access the application**:
   - Open a browser and navigate to `http://localhost:8080`

### Production Deployment

1. **Option 1: Static hosting with Firebase**:
   ```bash
   # Install Firebase CLI if not already installed
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in your project directory
   cd frontend
   firebase init hosting
   
   # Deploy to Firebase Hosting
   firebase deploy --only hosting
   ```

2. **Option 2: Deploy to Netlify**:
   - Create a `netlify.toml` file in the frontend directory:
     ```toml
     [build]
       publish = "."
       command = "echo 'No build step needed'"
     
     [[redirects]]
       from = "/*"
       to = "/index.html"
       status = 200
     ```
   - Deploy using the Netlify CLI or connect your GitHub repository to Netlify

3. **Option 3: Deploy to GitHub Pages**:
   - Push your frontend code to a GitHub repository
   - Go to repository settings → Pages
   - Select the branch to deploy from and the root folder
   - Click Save

## Environment Configuration

### Update API Endpoint

After deployment, update the API endpoint in the frontend code:

1. Open `frontend/js/app.js`
2. Locate the `API_URL` constant at the top of the file
3. Update it with your production backend URL:
   ```javascript
   const API_URL = 'https://your-api-domain.com/api';
   ```

## Model Deployment

The flower classification model should be deployed with the backend:

1. Place your trained model file (`flower_classifier.pth`) in the `backend/models/` directory
2. Make sure `class_names.json` is also in the `backend/models/` directory
3. If deploying with Docker, mount these files as volumes or include them in the Docker image

## Monitoring and Maintenance

- Set up logging and monitoring for the backend API
- Implement CI/CD for automated deployments
- Regularly update dependencies to maintain security
- Monitor Firebase usage and quotas

## Troubleshooting

### Common Issues

1. **CORS errors**:
   - Ensure the backend has proper CORS middleware configured
   - Check that allowed origins include your frontend domain

2. **Firebase authentication issues**:
   - Verify the credentials file is correct and accessible
   - Check Firebase console for any quota or permission issues

3. **Model loading errors**:
   - Confirm model file paths are correct
   - Ensure model is compatible with the version of PyTorch being used