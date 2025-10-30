"""PostgreSQL database connection and operations"""
import asyncpg
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.config import settings
from app.utils.logger import logger


class DatabaseService:
    """PostgreSQL database service using asyncpg"""
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        
    async def initialize(self):
        """Initialize database connection pool"""
        try:
            logger.info(f"Connecting to PostgreSQL at {settings.postgres_host}:{settings.postgres_port}")
            
            self.pool = await asyncpg.create_pool(
                host=settings.postgres_host,
                port=settings.postgres_port,
                database=settings.postgres_db,
                user=settings.postgres_user,
                password=settings.postgres_password,
                min_size=5,
                max_size=settings.postgres_pool_size,
                command_timeout=settings.postgres_pool_timeout,
            )
            
            logger.info("PostgreSQL connection pool created successfully")
            
            # Test connection
            async with self.pool.acquire() as connection:
                version = await connection.fetchval("SELECT version()")
                logger.info(f"PostgreSQL version: {version}")
                
        except Exception as e:
            logger.error(f"Error connecting to PostgreSQL: {e}")
            raise
    
    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("PostgreSQL connection pool closed")
    
    async def test_connection(self) -> bool:
        """Test database connection"""
        try:
            if not self.pool:
                await self.initialize()
            
            async with self.pool.acquire() as connection:
                await connection.fetchval("SELECT 1")
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False
    
    async def get_correspondence_by_id(self, correspondence_id: str) -> Optional[Dict[str, Any]]:
        """Get correspondence by ID"""
        try:
            async with self.pool.acquire() as connection:
                row = await connection.fetchrow(
                    """
                    SELECT 
                        "Id" as id,
                        "MailNum" as mail_num,
                        "MailDate" as mail_date,
                        "Subject" as subject,
                        "BodyText" as body_text,
                        "CorrespondenceType" as correspondence_type,
                        "SecrecyLevel" as secrecy_level,
                        "PriorityLevel" as priority_level,
                        "PersonalityLevel" as personality_level,
                        "CreateAt" as created_at,
                        "ExternalReferenceNumber" as external_reference_number
                    FROM "Correspondences"
                    WHERE "Id" = $1 AND "IsDeleted" = false
                    """,
                    correspondence_id
                )
                
                return dict(row) if row else None
                
        except Exception as e:
            logger.error(f"Error getting correspondence {correspondence_id}: {e}")
            raise
    
    async def get_all_correspondences(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get all correspondences with pagination"""
        try:
            async with self.pool.acquire() as connection:
                rows = await connection.fetch(
                    """
                    SELECT 
                        "Id" as id,
                        "MailNum" as mail_num,
                        "MailDate" as mail_date,
                        "Subject" as subject,
                        "BodyText" as body_text,
                        "CorrespondenceType" as correspondence_type,
                        "SecrecyLevel" as secrecy_level,
                        "PriorityLevel" as priority_level,
                        "PersonalityLevel" as personality_level,
                        "CreateAt" as created_at,
                        "ExternalReferenceNumber" as external_reference_number
                    FROM "Correspondences"
                    WHERE "IsDeleted" = false
                    ORDER BY "CreateAt" DESC
                    LIMIT $1 OFFSET $2
                    """,
                    limit,
                    offset
                )
                
                return [dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Error getting correspondences: {e}")
            raise
    
    async def get_correspondences_since(self, since_date: datetime) -> List[Dict[str, Any]]:
        """Get correspondences updated since a specific date"""
        try:
            async with self.pool.acquire() as connection:
                rows = await connection.fetch(
                    """
                    SELECT 
                        "Id" as id,
                        "MailNum" as mail_num,
                        "MailDate" as mail_date,
                        "Subject" as subject,
                        "BodyText" as body_text,
                        "CorrespondenceType" as correspondence_type,
                        "SecrecyLevel" as secrecy_level,
                        "PriorityLevel" as priority_level,
                        "PersonalityLevel" as personality_level,
                        "CreateAt" as created_at,
                        "ExternalReferenceNumber" as external_reference_number
                    FROM "Correspondences"
                    WHERE "IsDeleted" = false 
                    AND ("CreateAt" >= $1 OR "UpdateAt" >= $1)
                    ORDER BY "CreateAt" DESC
                    """,
                    since_date
                )
                
                return [dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Error getting correspondences since {since_date}: {e}")
            raise
    
    async def get_correspondence_count(self) -> int:
        """Get total count of correspondences"""
        try:
            async with self.pool.acquire() as connection:
                count = await connection.fetchval(
                    """
                    SELECT COUNT(*) 
                    FROM "Correspondences"
                    WHERE "IsDeleted" = false
                    """
                )
                return count
                
        except Exception as e:
            logger.error(f"Error getting correspondence count: {e}")
            raise
    
    async def create_conversation_tables(self):
        """Create conversation tables if they don't exist"""
        try:
            async with self.pool.acquire() as connection:
                # Create conversations table
                await connection.execute("""
                    CREATE TABLE IF NOT EXISTS rag_conversations (
                        id UUID PRIMARY KEY,
                        user_id UUID NOT NULL,
                        title VARCHAR(500) NOT NULL,
                        language VARCHAR(5) NOT NULL DEFAULT 'ar',
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        last_message_at TIMESTAMP,
                        message_count INTEGER NOT NULL DEFAULT 0,
                        is_active BOOLEAN NOT NULL DEFAULT true
                    )
                """)
                
                # Create conversation_messages table
                await connection.execute("""
                    CREATE TABLE IF NOT EXISTS rag_conversation_messages (
                        id UUID PRIMARY KEY,
                        conversation_id UUID NOT NULL REFERENCES rag_conversations(id) ON DELETE CASCADE,
                        role VARCHAR(20) NOT NULL,
                        content TEXT NOT NULL,
                        sources JSONB,
                        metadata JSONB,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW()
                    )
                """)
                
                # Create indexes
                await connection.execute("""
                    CREATE INDEX IF NOT EXISTS idx_conversations_user_id
                    ON rag_conversations(user_id)
                """)
                
                await connection.execute("""
                    CREATE INDEX IF NOT EXISTS idx_conversations_user_active
                    ON rag_conversations(user_id, is_active, last_message_at DESC)
                """)
                
                await connection.execute("""
                    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
                    ON rag_conversation_messages(conversation_id, created_at)
                """)
                
                logger.info("Conversation tables created successfully")
                
        except Exception as e:
            logger.error(f"Error creating conversation tables: {e}")
            raise


# Create global database service instance
database_service = DatabaseService()


__all__ = ["database_service", "DatabaseService"]

