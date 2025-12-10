# MRI Tumor Classifier
A web application that uses YOLO to detect tumors in MRI scans.
## Prerequisites
- **Node.js** and **npm** (for the frontend)
- **Python 3.8+** (for the backend)
## Installation
### 1. Install Frontend Dependencies
```bash
npm install
```
### 2. Install Backend Dependencies
```bash
pip install fastapi uvicorn python-multipart pillow ultralytics
```
## Running the Application
You need to run **both** the frontend and backend servers simultaneously.
### Terminal 1: Start the Backend
```bash
uvicorn src.api.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will be available at **http://127.0.0.1:8000**
### Terminal 2: Start the Frontend
```bash
npm start
```
The React app will automatically open at **http://localhost:3000**
## Usage
1. Open your browser to **http://localhost:3000**
2. Upload an MRI image
3. The YOLO model will detect tumors and return an annotated image
## API Documentation
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc
## Tech Stack
- **Frontend**: React
- **Backend**: FastAPI + YOLO (Ultralytics)
- **Model**: YOLOv12n for tumor detection
