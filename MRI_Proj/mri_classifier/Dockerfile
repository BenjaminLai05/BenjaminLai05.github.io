# ── Stage 1: Build React frontend ──────────────────────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY public/ public/
COPY src/ src/

# Set the API URL to the Railway backend (same service, same origin)
ENV REACT_APP_API_URL=""

RUN npm run build

# ── Stage 2: Python API + serve built frontend ──────────────────────────────
FROM python:3.11-slim

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir --force-reinstall --no-deps opencv-python-headless==4.10.0.84

# Copy API source
COPY src/ src/

# Copy built React app from stage 1
COPY --from=frontend-builder /app/build ./build

# Railway sets PORT env var
CMD uvicorn src.api.main:app --host 0.0.0.0 --port ${PORT:-8000}
