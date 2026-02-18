FROM python:3.11-slim

# Install system dependencies for OpenCV (libGL) and general libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir --force-reinstall --no-deps opencv-python-headless==4.10.0.84

# Copy the rest of the application
COPY . .

# Railway sets PORT env var
CMD uvicorn src.api.main:app --host 0.0.0.0 --port ${PORT:-8000}
