"""Configuration management using pydantic-settings"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # Server
    port: int = 3001
    env: str = "development"
    
    # PostgreSQL
    postgres_host: str = "cm-db.inss.local"
    postgres_port: int = 5432
    postgres_db: str = "cmdb"
    postgres_user: str = "cmuser"
    postgres_password: str = "@DYKMk7xjB25"
    postgres_pool_size: int = 20
    postgres_pool_timeout: int = 30
    
    # Qdrant
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: Optional[str] = None
    
    # Ollama (للـ LLM فقط)
    ollama_url: str = "http://localhost:11434"
    ollama_chat_model: str = "gpt-oss:20b"
    ollama_timeout: int = 120000
    
    # Embedding Model (sentence-transformers)
    embedding_model: str = "intfloat/multilingual-e5-large"
    embedding_dimension: int = 1024
    
    # Whisper
    whisper_model: str = "large-v3"
    whisper_device: str = "cuda"  # أو cpu
    
    # RAG Configuration
    chunk_size: int = 500
    chunk_overlap: int = 50
    max_results: int = 10
    similarity_threshold: float = 0.7
    
    # Collections
    correspondence_collection: str = "bdfm_correspondences"
    workflow_collection: str = "bdfm_workflows"
    user_guide_collection: str = "bdfm_user_guide"
    
    # Speech-to-Text
    max_audio_file_size: int = 26214400  # 25MB
    max_audio_duration: int = 600  # 10 minutes
    upload_dir: str = "uploads/audio"
    supported_audio_formats: list[str] = ["mp3", "wav", "ogg", "m4a", "webm", "flac"]
    
    # Statistics
    stats_cache_enabled: bool = True
    stats_cache_ttl: int = 300  # 5 minutes
    
    # Logging
    log_level: str = "info"
    log_file: str = "logs/bdfm-rag.log"
    
    # Auto-Sync
    auto_sync_enabled: bool = True
    scheduled_sync_enabled: bool = True
    sync_interval_minutes: int = 5
    
    @property
    def database_url(self) -> str:
        """Get PostgreSQL connection URL"""
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    @property
    def async_database_url(self) -> str:
        """Get async PostgreSQL connection URL"""
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.env.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.env.lower() == "development"


# Create global settings instance
settings = Settings()


# Ensure upload directory exists
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs("logs", exist_ok=True)

