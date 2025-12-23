# MRI Tumor Classifier
A professional medical imaging web application that uses YOLOv12 to detect tumors in MRI scans with integrated patient management and clinical tracking.

## Core Features
- **Automated Tumor Detection:** Real-time scanning using YOLOv8/v12 with adjustable confidence thresholds.
- **Dynamic Patient Records:** Add scan results directly to a patient's historical profile.
- **Clinical Trend Analysis:** Visualize tumor progression over time with interactive confidence and count charts.
- **Editable Clinical Data:** Modify patient narratives, age, and gender directly in the UI (session-based).
- **History Tracking:** Comprehensive scan history with detection status and model metadata.
- **Exemplar Dataset:** Internal tool to download sample MRI datasets for benchmarking.

## Prerequisites
- **Node.js** and **npm** (for the React frontend)
- **Python 3.8+** (for the FastAPI backend)

## Installation

### 1. Install Frontend Dependencies
```bash
cd mri_classifier
npm install
```

### 2. Install Backend Dependencies
```bash
# From the project root
pip install fastapi uvicorn python-multipart pillow ultralytics SimpleITK numpy
```

## Running the Application
You need to run **both** the frontend and backend servers simultaneously.

### Terminal 1: Start the Backend
```bash
cd mri_classifier
uvicorn src.api.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will be available at **http://127.0.0.1:8000**

### Terminal 2: Start the Frontend
```bash
cd mri_classifier
npm start
```
The React app will open at **http://localhost:3000**

## Usage
1. **Selection:** Choose a patient from the clinical selector in the Patient History panel.
2. **Analysis:** Upload an MRI image and click **Scan**.
3. **Recording:** Click **Add to Patient** to log the scan into the patient's dynamic history.
4. **Tracking:** Review trends in the **Tumor Detection Confidence** chart.

## API Documentation
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## Tech Stack
- **Frontend**: React (Hooks, Context-like state management)
- **Backend**: FastAPI
- **AI/ML**: YOLOv12 (Ultralytics) for detection
- **Visualization**: Recharts for clinical trend lines
- **Styling**: Modern Glassmorphism UI with Vanilla CSS
