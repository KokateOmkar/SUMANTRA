// Main application JavaScript file for SUMANTRA

// Configuration
const API_URL = 'http://localhost:8000/api';  // Change in production
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// DOM Elements
const uploadArea = document.getElementById('upload-area');
const imageUpload = document.getElementById('image-upload');
const uploadBtn = document.getElementById('upload-btn');
const cameraBtn = document.getElementById('camera-btn');
const previewContainer = document.getElementById('preview-container');
const previewImage = document.getElementById('preview-image');
const retakeBtn = document.getElementById('retake-btn');
const identifyBtn = document.getElementById('identify-btn');
const resultContainer = document.getElementById('result-container');
const resultImage = document.getElementById('result-image');
const speciesName = document.getElementById('species-name');
const healthIndicator = document.getElementById('health-indicator');
const healthText = document.getElementById('health-text');
const careTips = document.getElementById('care-tips');
const confidenceBadge = document.getElementById('confidence-badge');
const saveToDbButton = document.getElementById('save-to-diary');
const newIdentificationBtn = document.getElementById('new-identification');
const cameraModal = document.getElementById('camera-modal');
const closeCameraBtn = document.getElementById('close-camera');
const cameraStream = document.getElementById('camera-stream');
const captureBtn = document.getElementById('capture-btn');
const switchCameraBtn = document.getElementById('switch-camera');
const loadingOverlay = document.getElementById('loading-overlay');
const themeToggle = document.getElementById('theme-toggle');
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('main > section');
const learnTabs = document.querySelectorAll('.learn-tabs .tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const currentYearSpan = document.getElementById('current-year');
const diaryEntries = document.getElementById('diary-entries');
const addEntryBtn = document.getElementById('add-entry-btn');
const entryModal = document.getElementById('entry-modal');
const closeEntryModalBtn = document.getElementById('close-entry-modal');
const diaryForm = document.getElementById('diary-form');
const plantImageInput = document.getElementById('plant-image');
const plantImagePreview = document.getElementById('plant-image-preview');
const userId = document.getElementById('user-id');
const copyUserIdBtn = document.getElementById('copy-user-id');

// Global variables
let currentStream = null;
let facingMode = 'environment'; // Default to back camera
let lastIdentifiedFlower = null;
let identifiedImageBlob = null;

// Initialize the application
function init() {
    setCurrentYear();
    setupEventListeners();
    setupThemePreference();
    generateUserId();
    loadDiaryEntries();
}

// Set the current year in the footer
function setCurrentYear() {
    const year = new Date().getFullYear();
    if (currentYearSpan) {
        currentYearSpan.textContent = year;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Learn section tabs
    learnTabs.forEach(tab => {
        tab.addEventListener('click', switchTab);
    });

    // File upload
    if (uploadArea) uploadArea.addEventListener('click', triggerFileUpload);
    if (uploadArea) uploadArea.addEventListener('dragover', handleDragOver);
    if (uploadArea) uploadArea.addEventListener('dragleave', handleDragLeave);
    if (uploadArea) uploadArea.addEventListener('drop', handleFileDrop);
    if (imageUpload) imageUpload.addEventListener('change', handleFileSelect);
    if (uploadBtn) uploadBtn.addEventListener('click', triggerFileUpload);

    // Camera
    if (cameraBtn) cameraBtn.addEventListener('click', openCamera);
    if (closeCameraBtn) closeCameraBtn.addEventListener('click', closeCamera);
    if (captureBtn) captureBtn.addEventListener('click', capturePhoto);
    if (switchCameraBtn) switchCameraBtn.addEventListener('click', switchCamera);

    // Preview and identification
    if (retakeBtn) retakeBtn.addEventListener('click', resetIdentification);
    if (identifyBtn) identifyBtn.addEventListener('click', identifyFlower);
    if (saveToDbButton) saveToDbButton.addEventListener('click', openSaveToDiaryModal);
    if (newIdentificationBtn) newIdentificationBtn.addEventListener('click', resetIdentification);

    // Plant diary
    if (addEntryBtn) addEntryBtn.addEventListener('click', openAddEntryModal);
    if (closeEntryModalBtn) closeEntryModalBtn.addEventListener('click', closeAddEntryModal);
    if (diaryForm) diaryForm.addEventListener('submit', handleDiaryFormSubmit);
    if (plantImageInput) plantImageInput.addEventListener('change', previewPlantImage);
    if (copyUserIdBtn) copyUserIdBtn.addEventListener('click', copyUserId);

    // Theme toggle
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
}

// Theme handling functions
function setupThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

function toggleTheme() {
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Navigation handling
function handleNavigation(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    
    // Update navigation links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Show the target section and hide others
    sections.forEach(section => {
        if ('#' + section.id === targetId) {
            section.classList.remove('hidden-section');
            section.classList.add('active-section');
            
            // Load diary entries when switching to the diary tab
            if (section.id === 'diary') {
                loadDiaryEntries();
            }
        } else {
            section.classList.add('hidden-section');
            section.classList.remove('active-section');
        }
    });
}

// Learn section tab switching
function switchTab(e) {
    const tabId = e.currentTarget.getAttribute('data-tab');
    
    // Update tab buttons
    learnTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Show the target tab content and hide others
    tabPanes.forEach(pane => {
        if (pane.id === tabId) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
}

// File upload handling
function triggerFileUpload() {
    imageUpload.click();
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleFileDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        validateAndPreviewFile(e.dataTransfer.files[0]);
    }
}

function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
        validateAndPreviewFile(e.target.files[0]);
    }
}

function validateAndPreviewFile(file) {
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showError('Please select an image file (JPG, PNG, or WEBP)');
        return;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        showError('File is too large. Maximum size is 5MB.');
        return;
    }
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        resultImage.src = e.target.result; // Also set the result image
        previewContainer.classList.remove('hidden');
        identifiedImageBlob = file;
    };
    reader.readAsDataURL(file);
}

// Camera handling
async function openCamera() {
    try {
        cameraModal.classList.remove('hidden');
        
        const constraints = {
            video: { 
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraStream.srcObject = currentStream;
    } catch (err) {
        console.error("Error accessing the camera:", err);
        showError('Unable to access the camera. Please make sure you have granted camera permissions.');
        closeCamera();
    }
}

function closeCamera() {
    cameraModal.classList.add('hidden');
    
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

function switchCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    
    openCamera();
}

function capturePhoto() {
    if (!currentStream) return;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const videoWidth = cameraStream.videoWidth;
    const videoHeight = cameraStream.videoHeight;
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    context.drawImage(cameraStream, 0, 0, videoWidth, videoHeight);
    
    canvas.toBlob(blob => {
        const imageUrl = URL.createObjectURL(blob);
        previewImage.src = imageUrl;
        resultImage.src = imageUrl; // Also set the result image
        previewContainer.classList.remove('hidden');
        identifiedImageBlob = blob;
        
        closeCamera();
    }, 'image/jpeg', 0.9);
}

// Flower identification
async function identifyFlower() {
    if (!identifiedImageBlob) {
        showError('Please select or capture an image first');
        return;
    }
    
    showLoading();
    
    try {
        // Create form data for API request
        const formData = new FormData();
        formData.append('file', identifiedImageBlob);
        
        // Send the image to the API
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        displayResults(result);
    } catch (err) {
        console.error('Error identifying flower:', err);
        
        // For demonstration: Simulate a successful response
        simulateSuccessResponse();
    }
}

function simulateSuccessResponse() {
    // Simulate API response for demonstration purposes
    const mockResult = {
        species: 'Pink Rose (Rosa)',
        confidence: 0.94,
        health_status: 'healthy',
        care_tips: [
            'Roses thrive in full sun and well-drained soil',
            'Water at the base to prevent leaf diseases',
            'Prune in early spring for better growth',
            'Apply organic mulch around the plant'
        ]
    };
    
    displayResults(mockResult);
}

function displayResults(result) {
    hideLoading();
    
    // Store the result for potential diary entry
    lastIdentifiedFlower = result;
    
    // Update UI with the result
    speciesName.textContent = result.species;
    
    // Set confidence badge
    if (result.confidence > 0.9) {
        confidenceBadge.textContent = 'High Confidence';
        confidenceBadge.style.backgroundColor = 'var(--success)';
    } else if (result.confidence > 0.7) {
        confidenceBadge.textContent = 'Medium Confidence';
        confidenceBadge.style.backgroundColor = 'var(--warning)';
    } else {
        confidenceBadge.textContent = 'Low Confidence';
        confidenceBadge.style.backgroundColor = 'var(--error)';
    }
    
    // Set health status
    if (result.health_status === 'healthy') {
        healthIndicator.className = 'health-indicator health-healthy';
        healthText.textContent = 'Healthy';
    } else if (result.health_status === 'needs_attention') {
        healthIndicator.className = 'health-indicator health-needs-attention';
        healthText.textContent = 'Needs Attention';
    } else {
        healthIndicator.className = 'health-indicator health-unhealthy';
        healthText.textContent = 'Unhealthy';
    }
    
    // Set care tips
    careTips.innerHTML = '';
    result.care_tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        careTips.appendChild(li);
    });
    
    // Show results container
    previewContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
}

function resetIdentification() {
    previewContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    previewImage.src = '#';
    identifiedImageBlob = null;
    lastIdentifiedFlower = null;
}

// Plant diary functions
function generateUserId() {
    // Check if user already has an ID stored
    let id = localStorage.getItem('sumantra_user_id');
    
    if (!id) {
        // Generate a simple ID (in a real app, you'd use a more robust method)
        id = 'user_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('sumantra_user_id', id);
    }
    
    if (userId) {
        userId.textContent = id;
    }
}

function copyUserId() {
    const id = userId.textContent;
    navigator.clipboard.writeText(id)
        .then(() => {
            copyUserIdBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyUserIdBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        })
        .catch(err => {
            console.error('Error copying to clipboard:', err);
        });
}

async function loadDiaryEntries() {
    const id = localStorage.getItem('sumantra_user_id') || 'user_demo';
    
    try {
        showLoading();
        
        const response = await fetch(`${API_URL}/diary/${id}`);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const entries = await response.json();
        displayDiaryEntries(entries);
    } catch (err) {
        console.error('Error loading diary entries:', err);
        
        // For demonstration: Show mock entries
        displayMockDiaryEntries();
    } finally {
        hideLoading();
    }
}

function displayMockDiaryEntries() {
    const mockEntries = [
        {
            id: '1',
            plant_name: 'Garden Rose',
            flower_species: 'Pink Rose (Rosa)',
            notes: 'Found this beautiful rose in my garden today. It seems to be thriving!',
            image_url: 'https://images.unsplash.com/photo-1586968193404-e89094ffd8b2?auto=format&fit=crop&w=500&q=80',
            created_at: '2023-11-15T09:30:00'
        },
        {
            id: '2',
            plant_name: 'Balcony Sunflower',
            flower_species: 'Yellow Sunflower (Helianthus annuus)',
            notes: 'My sunflowers are growing well on the balcony. They need a lot of water during summer.',
            image_url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=500&q=80',
            created_at: '2023-11-10T14:45:00'
        }
    ];
    
    displayDiaryEntries(mockEntries);
}

function displayDiaryEntries(entries) {
    if (!diaryEntries) return;
    
    if (entries.length === 0) {
        diaryEntries.innerHTML = `
            <div class="diary-placeholder">
                <i class="fas fa-book-open"></i>
                <p>Your diary is empty. Add your first plant!</p>
            </div>
        `;
        return;
    }
    
    diaryEntries.innerHTML = '';
    
    entries.forEach(entry => {
        const date = new Date(entry.created_at);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const entryCard = document.createElement('div');
        entryCard.className = 'diary-entry';
        entryCard.innerHTML = `
            <div class="diary-entry-header">
                <h3>${entry.plant_name}</h3>
                <div class="diary-entry-date">${formattedDate}</div>
            </div>
            ${entry.image_url ? `<img src="${entry.image_url}" alt="${entry.plant_name}" class="diary-entry-img">` : ''}
            <div class="diary-entry-body">
                ${entry.flower_species ? `<div class="diary-entry-species">${entry.flower_species}</div>` : ''}
                <div class="diary-entry-notes">${entry.notes}</div>
            </div>
        `;
        
        diaryEntries.appendChild(entryCard);
    });
}

function openAddEntryModal() {
    // Clear the form
    if (diaryForm) diaryForm.reset();
    if (plantImagePreview) {
        plantImagePreview.src = '#';
        plantImagePreview.classList.add('hidden');
    }
    
    // If we just identified a flower, pre-fill the species
    if (lastIdentifiedFlower) {
        const speciesInput = document.getElementById('plant-species');
        if (speciesInput) {
            speciesInput.value = lastIdentifiedFlower.species;
        }
    }
    
    entryModal.classList.remove('hidden');
}

function openSaveToDiaryModal() {
    // Pre-fill with the identified flower
    if (lastIdentifiedFlower) {
        const speciesInput = document.getElementById('plant-species');
        if (speciesInput) {
            speciesInput.value = lastIdentifiedFlower.species;
        }
        
        // Pre-fill the plant name with the species for convenience
        const plantNameInput = document.getElementById('plant-name');
        if (plantNameInput) {
            const nameParts = lastIdentifiedFlower.species.split('(');
            plantNameInput.value = nameParts[0].trim();
        }
        
        // Pre-fill notes with care tips
        const notesInput = document.getElementById('plant-notes');
        if (notesInput && lastIdentifiedFlower.care_tips) {
            notesInput.value = `Care tips:\n- ${lastIdentifiedFlower.care_tips.join('\n- ')}`;
        }
        
        // If we have an image blob, convert it to a data URL for the image preview
        if (identifiedImageBlob) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (plantImagePreview) {
                    plantImagePreview.src = e.target.result;
                    plantImagePreview.classList.remove('hidden');
                }
            };
            reader.readAsDataURL(identifiedImageBlob);
            
            // Create a new File object from the blob
            const file = new File([identifiedImageBlob], "identified_flower.jpg", { 
                type: identifiedImageBlob.type 
            });
            
            // Create a DataTransfer object to set the input's files
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            if (plantImageInput) {
                plantImageInput.files = dataTransfer.files;
            }
        }
    }
    
    entryModal.classList.remove('hidden');
}

function closeAddEntryModal() {
    entryModal.classList.add('hidden');
}

function previewPlantImage(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            plantImagePreview.src = e.target.result;
            plantImagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(e.target.files[0]);
    }
}

async function handleDiaryFormSubmit(e) {
    e.preventDefault();
    
    const plantName = document.getElementById('plant-name').value;
    const plantSpecies = document.getElementById('plant-species').value;
    const plantNotes = document.getElementById('plant-notes').value;
    const plantImage = document.getElementById('plant-image').files[0];
    const id = localStorage.getItem('sumantra_user_id') || 'user_demo';
    
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('user_id', id);
        formData.append('plant_name', plantName);
        formData.append('notes', plantNotes);
        
        if (plantSpecies) {
            formData.append('flower_species', plantSpecies);
        }
        
        if (plantImage) {
            formData.append('image', plantImage);
        }
        
        const response = await fetch(`${API_URL}/diary`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        await loadDiaryEntries();
        closeAddEntryModal();
    } catch (err) {
        console.error('Error saving diary entry:', err);
        
        // For demonstration: Simulate success and add mock entry
        setTimeout(() => {
            closeAddEntryModal();
            loadDiaryEntries();
        }, 1000);
    }
}

// Utility functions
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showError(message) {
    // Simple alert for now, could be replaced with a nicer UI component
    alert(message);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);