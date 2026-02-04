# main.py - Entry point for Railway deployment
# This file imports the FastAPI app from src/api/main.py

from src.api.main import app

# Railway will auto-detect this as a FastAPI project and run:
# uvicorn main:app --host 0.0.0.0 --port $PORT
