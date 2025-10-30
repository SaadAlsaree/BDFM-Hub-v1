"""Pydantic models for API requests and responses"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============= Request Models =============

class QueryRequest(BaseModel):
    """RAG query request"""
    query: str = Field(..., description="الاستعلام")
    language: Optional[str] = Field("ar", description="اللغة (ar أو en)")
    max_results: Optional[int] = Field(None, description="عدد النتائج الأقصى")
    similarity_threshold: Optional[float] = Field(None, description="عتبة التشابه")
    filters: Optional[Dict[str, Any]] = Field(None, description="فلاتر إضافية")


class SearchRequest(BaseModel):
    """Search request (without LLM)"""
    query: str = Field(..., description="الاستعلام")
    max_results: Optional[int] = Field(None, description="عدد النتائج")
    threshold: Optional[float] = Field(None, description="عتبة التشابه")
    filters: Optional[Dict[str, Any]] = Field(None, description="فلاتر")


class SyncRequest(BaseModel):
    """Sync request"""
    type: str = Field("full", description="نوع المزامنة (full أو incremental)")
    from_date: Optional[str] = Field(None, description="تاريخ البداية للمزامنة التزايدية")
    batch_size: Optional[int] = Field(100, description="حجم الدفعة")


class IndexRequest(BaseModel):
    """Index single correspondence request"""
    correspondence_id: str = Field(..., description="معرف المراسلة")


class TranscribeRequest(BaseModel):
    """Transcribe audio request"""
    language: Optional[str] = Field("ar", description="اللغة")
    task: Optional[str] = Field("transcribe", description="المهمة (transcribe أو translate)")


class TranscribeUrlRequest(BaseModel):
    """Transcribe from URL request"""
    url: str = Field(..., description="رابط الملف الصوتي")
    language: Optional[str] = Field("ar", description="اللغة")
    task: Optional[str] = Field("transcribe", description="المهمة")


# ============= Response Models =============

class SearchResult(BaseModel):
    """Search result"""
    id: str
    mail_num: str
    mail_date: Optional[str] = None
    subject: str
    body_text: Optional[str] = None
    correspondence_type: Optional[str] = None
    secrecy_level: Optional[str] = None
    priority_level: Optional[str] = None
    personality_level: Optional[str] = None
    similarity_score: float
    highlights: Optional[List[str]] = None


class RAGResponse(BaseModel):
    """RAG query response"""
    answer: str
    sources: List[SearchResult]
    language: str
    metadata: Dict[str, Any]


class SyncResult(BaseModel):
    """Sync result"""
    success: bool
    synced: int
    failed: int
    duration: str
    errors: Optional[List[str]] = None


class ApiResponse(BaseModel):
    """Generic API response"""
    success: bool
    data: Any
    timestamp: str


class TranscriptionResult(BaseModel):
    """Speech-to-text transcription result"""
    text: str
    language: str
    segments: Optional[List[Dict[str, Any]]] = None
    metadata: Dict[str, Any]


# ============= Conversation Models =============

class ConversationMessage(BaseModel):
    """Conversation message"""
    id: Optional[str] = None
    role: str  # user or assistant
    content: str
    created_at: Optional[datetime] = None


class CreateConversationRequest(BaseModel):
    """Create conversation request"""
    title: Optional[str] = Field(None, description="عنوان المحادثة")


class SendMessageRequest(BaseModel):
    """Send message request"""
    conversation_id: str = Field(..., description="معرف المحادثة")
    message: str = Field(..., description="الرسالة")
    language: Optional[str] = Field("ar", description="اللغة")


class Conversation(BaseModel):
    """Conversation"""
    id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0


class ConversationWithMessages(Conversation):
    """Conversation with messages"""
    messages: List[ConversationMessage]


# ============= Statistics Models =============

class CorrespondenceStats(BaseModel):
    """Correspondence statistics"""
    total: int
    by_type: Dict[str, int]
    by_priority: Dict[str, int]
    by_secrecy: Dict[str, int]


class WorkflowStats(BaseModel):
    """Workflow statistics"""
    total: int
    completed: int
    pending: int
    overdue: int


__all__ = [
    "QueryRequest",
    "SearchRequest",
    "SyncRequest",
    "IndexRequest",
    "TranscribeRequest",
    "TranscribeUrlRequest",
    "SearchResult",
    "RAGResponse",
    "SyncResult",
    "ApiResponse",
    "TranscriptionResult",
    "ConversationMessage",
    "CreateConversationRequest",
    "SendMessageRequest",
    "Conversation",
    "ConversationWithMessages",
    "CorrespondenceStats",
    "WorkflowStats"
]

