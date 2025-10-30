"""FastAPI main application"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from app.config import settings
from app.utils.logger import logger
from app.database.postgres import database_service
from app.services.qdrant_service import qdrant_service
from app.services.embedding_service import embedding_service
from app.services.llm_service import llm_service
from app.services.speech_service import speech_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    logger.info("Starting BDFM RAG System...")
    
    try:
        # Initialize database
        await database_service.initialize()
        db_connected = await database_service.test_connection()
        
        if db_connected:
            logger.info("PostgreSQL connected successfully")
            # Create conversation tables
            await database_service.create_conversation_tables()
        else:
            logger.warning("PostgreSQL connection failed, but continuing...")
        
        # Initialize Qdrant
        qdrant_service.initialize()
        logger.info("Qdrant initialized successfully")
        
        # Verify models (in background, non-blocking)
        embedding_loaded = await embedding_service.check_model_loaded()
        if not embedding_loaded:
            logger.warning(f"Embedding model {settings.embedding_model} not loaded yet")
        
        ollama_connected = await llm_service.check_connection()
        if not ollama_connected:
            logger.warning(f"Ollama not available at {settings.ollama_url}")
        
        whisper_available = await speech_service.verify_model()
        if not whisper_available:
            logger.warning(f"Whisper model {settings.whisper_model} not available")
        
        # Cleanup old audio files
        await speech_service.cleanup_temp_files(24)
        
        logger.info("BDFM RAG System started successfully")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down BDFM RAG System...")
    
    try:
        await database_service.close()
        logger.info("Shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# Create FastAPI app
app = FastAPI(
    title="BDFM RAG System",
    version="2.0.0",
    description="RAG system with Python, FastAPI, Whisper, and multilingual-e5-large",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()
    
    logger.info(f"{request.method} {request.url.path}")
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    logger.info(f"Completed in {process_time:.0f}ms with status {response.status_code}")
    
    return response


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "success": True,
        "data": {
            "name": "BDFM RAG System",
            "version": "2.0.0",
            "description": "RAG system with Whisper, multilingual-e5-large, and FastAPI",
            "features": [
                "Direct Whisper integration for speech-to-text",
                "High-quality Arabic embeddings with multilingual-e5-large",
                "Auto-sync with PostgreSQL triggers",
                "Conversation support",
                "Statistics and analytics"
            ],
            "endpoints": {
                "rag": {
                    "query": "POST /api/rag/query",
                    "query_stream": "POST /api/rag/query/stream",
                    "search": "POST /api/rag/search",
                    "sync": "POST /api/rag/sync",
                    "index": "POST /api/rag/index",
                    "delete": "DELETE /api/rag/correspondence/{id}",
                    "rebuild": "POST /api/rag/rebuild",
                    "status": "GET /api/rag/status",
                    "sync_stats": "GET /api/rag/sync/stats"
                },
                "speech": {
                    "transcribe": "POST /api/rag/speech/transcribe",
                    "transcribe_url": "POST /api/rag/speech/transcribe-url",
                    "detect_language": "POST /api/rag/speech/detect-language",
                    "formats": "GET /api/rag/speech/formats"
                },
                "health": "GET /health"
            }
        },
        "timestamp": time.time()
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "uptime": time.process_time(),
            "timestamp": time.time()
        }
    }


# Import and include API routers
from app.api import rag

app.include_router(rag.router)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "message": "Internal server error",
                "details": str(exc) if settings.is_development else None
            },
            "timestamp": time.time()
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.is_development,
        log_level=settings.log_level.lower()
    )

