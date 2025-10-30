"""Speech-to-Text service using Whisper - الميزة الرئيسية الجديدة! ⭐"""
from faster_whisper import WhisperModel
import whisper
from typing import Optional, List, Dict, Any, Tuple
import os
import asyncio
from pathlib import Path
import httpx
import tempfile
from app.config import settings
from app.utils.logger import logger


class SpeechService:
    """
    خدمة تحويل الصوت إلى نص باستخدام Whisper
    
    الميزة الأساسية التي تبرر migration إلى Python!
    """
    
    def __init__(self):
        self.whisper_model_name = settings.whisper_model
        self.device = settings.whisper_device
        self.max_file_size = settings.max_audio_file_size
        self.max_duration = settings.max_audio_duration
        self.supported_formats = settings.supported_audio_formats
        self.upload_dir = Path(settings.upload_dir)
        
        # Models (lazy loading)
        self.faster_whisper_model: Optional[WhisperModel] = None
        self.whisper_model: Optional[Any] = None
        
        # Ensure upload directory exists
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def initialize_faster_whisper(self):
        """
        تحميل faster-whisper model (أسرع وأكثر كفاءة)
        """
        if self.faster_whisper_model is not None:
            return
        
        logger.info(f"Loading Faster-Whisper model: {self.whisper_model_name}")
        
        try:
            self.faster_whisper_model = WhisperModel(
                self.whisper_model_name,
                device=self.device,
                compute_type="float16" if self.device == "cuda" else "int8"
            )
            logger.info("Faster-Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading Faster-Whisper model: {e}")
            raise
    
    def initialize_whisper(self):
        """
        تحميل Whisper model الأصلي (fallback)
        """
        if self.whisper_model is not None:
            return
        
        logger.info(f"Loading Whisper model: {self.whisper_model_name}")
        
        try:
            self.whisper_model = whisper.load_model(self.whisper_model_name)
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading Whisper model: {e}")
            raise
    
    def validate_audio_file(
        self, 
        file_path: Path, 
        file_size: Optional[int] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        التحقق من صحة ملف الصوت
        
        Args:
            file_path: مسار الملف
            file_size: حجم الملف (optional)
            
        Returns:
            (valid, error_message)
        """
        # Check file exists
        if not file_path.exists():
            return False, "File does not exist"
        
        # Check file size
        if file_size is None:
            file_size = file_path.stat().st_size
        
        if file_size > self.max_file_size:
            max_mb = self.max_file_size / 1024 / 1024
            return False, f"File size exceeds maximum allowed size of {max_mb}MB"
        
        # Check file format
        ext = file_path.suffix.lower().replace('.', '')
        if ext not in self.supported_formats:
            return False, f"Unsupported file format. Supported: {', '.join(self.supported_formats)}"
        
        return True, None
    
    async def transcribe_audio(
        self,
        file_path: Path,
        language: str = "ar",
        task: str = "transcribe",
        use_faster_whisper: bool = True
    ) -> Dict[str, Any]:
        """
        نسخ ملف صوتي إلى نص
        
        Args:
            file_path: مسار الملف الصوتي
            language: اللغة (ar, en, auto)
            task: المهمة (transcribe أو translate)
            use_faster_whisper: استخدام faster-whisper (أسرع)
            
        Returns:
            نتيجة النسخ مع metadata
        """
        try:
            # Validate file
            valid, error = self.validate_audio_file(file_path)
            if not valid:
                raise ValueError(error)
            
            logger.info(f"Transcribing audio file: {file_path.name}")
            start_time = asyncio.get_event_loop().time()
            
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            
            if use_faster_whisper:
                result = await loop.run_in_executor(
                    None,
                    self._transcribe_with_faster_whisper,
                    str(file_path),
                    language,
                    task
                )
            else:
                result = await loop.run_in_executor(
                    None,
                    self._transcribe_with_whisper,
                    str(file_path),
                    language,
                    task
                )
            
            processing_time = (asyncio.get_event_loop().time() - start_time) * 1000
            
            result["metadata"]["processing_time"] = processing_time
            result["metadata"]["file_size"] = file_path.stat().st_size
            result["metadata"]["format"] = file_path.suffix.lower().replace('.', '')
            
            logger.info(f"Transcription completed in {processing_time:.0f}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise
    
    def _transcribe_with_faster_whisper(
        self,
        file_path: str,
        language: str,
        task: str
    ) -> Dict[str, Any]:
        """
        نسخ باستخدام faster-whisper (الأسرع والأكثر كفاءة)
        """
        if self.faster_whisper_model is None:
            self.initialize_faster_whisper()
        
        # Transcribe
        lang = None if language == "auto" else language
        
        segments, info = self.faster_whisper_model.transcribe(
            file_path,
            language=lang,
            task=task,
            beam_size=5,
            vad_filter=True,  # Voice Activity Detection
        )
        
        # Collect segments
        text_parts = []
        segment_list = []
        
        for segment in segments:
            text_parts.append(segment.text)
            segment_list.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text
            })
        
        full_text = " ".join(text_parts).strip()
        
        return {
            "text": full_text,
            "language": info.language if hasattr(info, 'language') else language,
            "segments": segment_list,
            "metadata": {
                "duration": info.duration if hasattr(info, 'duration') else None,
                "model": self.whisper_model_name,
                "backend": "faster-whisper"
            }
        }
    
    def _transcribe_with_whisper(
        self,
        file_path: str,
        language: str,
        task: str
    ) -> Dict[str, Any]:
        """
        نسخ باستخدام Whisper الأصلي (fallback)
        """
        if self.whisper_model is None:
            self.initialize_whisper()
        
        # Transcribe
        options = {"task": task}
        if language != "auto":
            options["language"] = language
        
        result = self.whisper_model.transcribe(file_path, **options)
        
        return {
            "text": result["text"].strip(),
            "language": result.get("language", language),
            "segments": result.get("segments", []),
            "metadata": {
                "model": self.whisper_model_name,
                "backend": "openai-whisper"
            }
        }
    
    async def transcribe_from_url(
        self,
        audio_url: str,
        language: str = "ar",
        task: str = "transcribe"
    ) -> Dict[str, Any]:
        """
        نسخ ملف صوتي من URL
        
        Args:
            audio_url: رابط الملف الصوتي
            language: اللغة
            task: المهمة
            
        Returns:
            نتيجة النسخ
        """
        try:
            logger.info(f"Downloading audio from URL: {audio_url}")
            
            # Download file
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.get(audio_url)
                response.raise_for_status()
                
                # Save to temporary file
                with tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=Path(audio_url).suffix or '.mp3',
                    dir=self.upload_dir
                ) as temp_file:
                    temp_file.write(response.content)
                    temp_path = Path(temp_file.name)
            
            try:
                # Transcribe
                result = await self.transcribe_audio(temp_path, language, task)
                return result
            finally:
                # Cleanup
                if temp_path.exists():
                    temp_path.unlink()
                    
        except Exception as e:
            logger.error(f"Error transcribing from URL: {e}")
            raise
    
    async def detect_language(self, file_path: Path) -> str:
        """
        كشف لغة الملف الصوتي
        
        Args:
            file_path: مسار الملف
            
        Returns:
            رمز اللغة (ar, en, etc.)
        """
        try:
            # Transcribe with auto language detection
            result = await self.transcribe_audio(file_path, language="auto")
            
            detected_language = result.get("language", "ar")
            logger.info(f"Detected language: {detected_language}")
            
            return detected_language
            
        except Exception as e:
            logger.error(f"Error detecting language: {e}")
            return "ar"  # Default to Arabic
    
    async def cleanup_temp_files(self, older_than_hours: int = 24):
        """
        تنظيف الملفات المؤقتة القديمة
        
        Args:
            older_than_hours: حذف الملفات الأقدم من X ساعات
        """
        try:
            import time
            
            now = time.time()
            threshold = older_than_hours * 60 * 60
            deleted_count = 0
            
            for file_path in self.upload_dir.glob("*"):
                if file_path.is_file():
                    age = now - file_path.stat().st_mtime
                    if age > threshold:
                        file_path.unlink()
                        deleted_count += 1
            
            if deleted_count > 0:
                logger.info(
                    f"Cleaned up {deleted_count} temporary files older than {older_than_hours} hours"
                )
                
        except Exception as e:
            logger.error(f"Error cleaning up temp files: {e}")
    
    def get_supported_formats(self) -> List[str]:
        """الحصول على قائمة الصيغ المدعومة"""
        return self.supported_formats
    
    def get_max_file_size(self) -> int:
        """الحصول على الحجم الأقصى للملف"""
        return self.max_file_size
    
    async def verify_model(self) -> bool:
        """فحص إذا كان Whisper model متاح"""
        try:
            # Try to initialize faster-whisper
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self.initialize_faster_whisper)
            return True
        except Exception as e:
            logger.error(f"Whisper model verification failed: {e}")
            # Try original whisper as fallback
            try:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, self.initialize_whisper)
                return True
            except:
                return False


# Create global speech service instance
speech_service = SpeechService()


__all__ = ["speech_service", "SpeechService"]

