"""Script to run the BDFM RAG System"""
import uvicorn
from app.config import settings


if __name__ == "__main__":
    print("=" * 60)
    print("  BDFM RAG System - Python Version 2.0.0")
    print("=" * 60)
    print(f"  Environment: {settings.env}")
    print(f"  Port: {settings.port}")
    print(f"  Embedding Model: {settings.embedding_model}")
    print(f"  Whisper Model: {settings.whisper_model}")
    print("=" * 60)
    print()
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.is_development,
        log_level=settings.log_level.lower()
    )

