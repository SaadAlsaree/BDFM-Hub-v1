"""RAG API routes"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import Optional
import json
from pathlib import Path
from app.models import (
    QueryRequest, SearchRequest, SyncRequest, IndexRequest,
    ApiResponse
)
from app.services.rag_service import rag_service
from app.services.sync_service import sync_service
from app.services.speech_service import speech_service
from app.utils.logger import logger
import time
import tempfile


router = APIRouter(prefix="/api/rag", tags=["RAG"])


# ============= RAG Endpoints =============

@router.post("/query")
async def query(request: QueryRequest):
    """RAG query endpoint"""
    try:
        result = await rag_service.query(request)
        
        return ApiResponse(
            success=True,
            data=result.dict(),
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in query endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query/stream")
async def query_stream(request: QueryRequest):
    """RAG query with streaming response"""
    try:
        async def event_generator():
            async for chunk in rag_service.query_stream(request):
                yield f"data: {json.dumps(chunk)}\n\n"
        
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream"
        )
        
    except Exception as e:
        logger.error(f"Error in query stream endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search(request: SearchRequest):
    """Search endpoint without LLM generation"""
    try:
        results = await rag_service.search(
            request.query,
            request.max_results,
            request.threshold,
            request.filters
        )
        
        return ApiResponse(
            success=True,
            data=[result.dict() for result in results],
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_status():
    """Get system status"""
    try:
        status = await rag_service.get_status()
        
        return ApiResponse(
            success=True,
            data=status,
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in status endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= Sync Endpoints =============

@router.post("/sync")
async def sync_correspondences(request: SyncRequest):
    """Sync correspondences from PostgreSQL to Qdrant"""
    try:
        result = await sync_service.sync_correspondences(request)
        
        return ApiResponse(
            success=result.success,
            data=result.dict(),
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in sync endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/index")
async def index_correspondence(request: IndexRequest):
    """Index a single correspondence"""
    try:
        success = await sync_service.sync_single_correspondence(request.correspondence_id)
        
        return ApiResponse(
            success=success,
            data={
                "correspondence_id": request.correspondence_id,
                "indexed": success
            },
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in index endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/correspondence/{correspondence_id}")
async def delete_correspondence(correspondence_id: str):
    """Delete correspondence from index"""
    try:
        success = await sync_service.delete_correspondence(correspondence_id)
        
        return ApiResponse(
            success=success,
            data={
                "correspondence_id": correspondence_id,
                "deleted": success
            },
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in delete endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rebuild")
async def rebuild_index():
    """Rebuild the entire index"""
    try:
        result = await sync_service.rebuild_index()
        
        return ApiResponse(
            success=result.success,
            data=result.dict(),
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in rebuild endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync/stats")
async def get_sync_stats():
    """Get synchronization statistics"""
    try:
        stats = await sync_service.get_sync_statistics()
        
        return ApiResponse(
            success=True,
            data=stats,
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in sync stats endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= Speech-to-Text Endpoints =============

@router.post("/speech/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("ar"),
    task: str = Form("transcribe")
):
    """Transcribe audio file to text"""
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=Path(file.filename).suffix,
            dir=speech_service.upload_dir
        ) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = Path(temp_file.name)
        
        try:
            # Transcribe
            result = await speech_service.transcribe_audio(
                temp_path,
                language=language,
                task=task
            )
            
            return ApiResponse(
                success=True,
                data=result,
                timestamp=str(time.time())
            )
            
        finally:
            # Cleanup
            if temp_path.exists():
                temp_path.unlink()
        
    except Exception as e:
        logger.error(f"Error in transcribe endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/speech/transcribe-url")
async def transcribe_from_url(
    url: str,
    language: str = "ar",
    task: str = "transcribe"
):
    """Transcribe audio from URL"""
    try:
        result = await speech_service.transcribe_from_url(url, language, task)
        
        return ApiResponse(
            success=True,
            data=result,
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in transcribe URL endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/speech/detect-language")
async def detect_language(file: UploadFile = File(...)):
    """Detect language of audio file"""
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=Path(file.filename).suffix,
            dir=speech_service.upload_dir
        ) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = Path(temp_file.name)
        
        try:
            # Detect language
            language = await speech_service.detect_language(temp_path)
            
            return ApiResponse(
                success=True,
                data={"language": language},
                timestamp=str(time.time())
            )
            
        finally:
            # Cleanup
            if temp_path.exists():
                temp_path.unlink()
        
    except Exception as e:
        logger.error(f"Error in detect language endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/speech/formats")
async def get_supported_formats():
    """Get supported audio formats"""
    try:
        formats = speech_service.get_supported_formats()
        max_size = speech_service.get_max_file_size()
        
        return ApiResponse(
            success=True,
            data={
                "supported_formats": formats,
                "max_file_size": max_size,
                "max_file_size_mb": max_size / 1024 / 1024
            },
            timestamp=str(time.time())
        )
        
    except Exception as e:
        logger.error(f"Error in formats endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


__all__ = ["router"]

