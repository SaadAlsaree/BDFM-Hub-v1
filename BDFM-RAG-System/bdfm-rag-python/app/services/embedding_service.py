"""Embedding service using sentence-transformers with multilingual-e5-large"""
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Any
import asyncio
from app.config import settings
from app.utils.logger import logger
from app.utils.helpers import chunk_text, generate_deterministic_id


class EmbeddingService:
    """Embedding service for generating vector embeddings using multilingual-e5-large"""
    
    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.embedding_model
        self.model: SentenceTransformer = None
        self.dimension = settings.embedding_dimension
        self._loading = False
        
    def initialize(self):
        """تحميل النموذج (Lazy loading)"""
        if self.model is not None or self._loading:
            return
            
        self._loading = True
        logger.info(f"Loading embedding model: {self.model_name}")
        
        try:
            self.model = SentenceTransformer(self.model_name)
            
            # Test embedding to get actual dimension
            test_embedding = self.model.encode("test", show_progress_bar=False)
            actual_dimension = len(test_embedding)
            
            if actual_dimension != self.dimension:
                logger.warning(
                    f"Expected dimension {self.dimension} but got {actual_dimension}. Updating config."
                )
                self.dimension = actual_dimension
            
            logger.info(f"Model loaded successfully. Dimension: {self.dimension}")
            
        except Exception as e:
            logger.error(f"Error loading embedding model: {e}")
            raise
        finally:
            self._loading = False
    
    async def generate_embedding(self, text: str, is_query: bool = False) -> List[float]:
        """
        توليد embedding لنص واحد
        
        Args:
            text: النص المراد ترميزه
            is_query: هل النص استعلام (query) أم passage
            
        Returns:
            Embedding vector كـ list
        """
        if not self.model:
            # تحميل في executor لتجنب blocking event loop
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self.initialize)
        
        # تشغيل encoding في executor
        loop = asyncio.get_event_loop()
        embedding = await loop.run_in_executor(
            None,
            self._encode_text,
            text,
            is_query
        )
        
        return embedding.tolist()
    
    def _encode_text(self, text: str, is_query: bool = False) -> np.ndarray:
        """
        ترميز النص (يعمل في thread منفصل)
        
        Args:
            text: النص
            is_query: هل هو query أم passage
            
        Returns:
            NumPy array of embedding
        """
        # E5 models تحتاج prefix
        # للـ queries: "query: ..."
        # للـ passages: "passage: ..."
        if 'e5' in self.model_name.lower():
            prefix = "query:" if is_query else "passage:"
            text = f"{prefix} {text}"
        
        embedding = self.model.encode(
            text,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        return embedding
    
    async def generate_embeddings_batch(
        self,
        texts: List[str],
        batch_size: int = 32,
        is_query: bool = False
    ) -> List[List[float]]:
        """
        توليد embeddings لعدة نصوص مع batch processing
        
        Args:
            texts: قائمة النصوص
            batch_size: حجم الدفعة
            is_query: هل النصوص queries أم passages
            
        Returns:
            قائمة من embeddings
        """
        if not self.model:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self.initialize)
        
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            None,
            self._encode_batch,
            texts,
            batch_size,
            is_query
        )
        
        return embeddings.tolist()
    
    def _encode_batch(
        self,
        texts: List[str],
        batch_size: int,
        is_query: bool = False
    ) -> np.ndarray:
        """
        ترميز دفعة من النصوص
        
        Args:
            texts: النصوص
            batch_size: حجم الدفعة
            is_query: نوع النصوص
            
        Returns:
            NumPy array of embeddings
        """
        # إضافة prefix للـ E5
        if 'e5' in self.model_name.lower():
            prefix = "query:" if is_query else "passage:"
            texts = [f"{prefix} {text}" for text in texts]
        
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            normalize_embeddings=True,
            show_progress_bar=True,
            convert_to_numpy=True
        )
        
        return embeddings
    
    async def generate_embeddings_for_correspondence(
        self,
        correspondence: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        توليد embeddings لمراسلة مع chunking
        
        Args:
            correspondence: بيانات المراسلة
            
        Returns:
            قائمة من embeddings مع metadata
        """
        # بناء النص الكامل
        full_text = self._build_correspondence_text(correspondence)
        
        # تقسيم إلى chunks
        chunks = chunk_text(
            full_text,
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap
        )
        
        logger.info(
            f"Generated {len(chunks)} chunks for correspondence {correspondence.get('id')}"
        )
        
        # توليد embeddings لكل chunk
        embeddings_list = await self.generate_embeddings_batch(
            chunks,
            batch_size=32,
            is_query=False  # Passages
        )
        
        # بناء النتيجة
        results = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings_list)):
            # استخدام ID حتمي
            embedding_id = generate_deterministic_id(correspondence.get('id'), i)
            
            results.append({
                'id': embedding_id,
                'correspondence_id': correspondence.get('id'),
                'text_chunk': chunk,
                'embedding_vector': embedding,
                'chunk_index': i,
                'metadata': {
                    'mail_num': correspondence.get('mail_num'),
                    'mail_date': correspondence.get('mail_date'),
                    'subject': correspondence.get('subject'),
                    'correspondence_type': correspondence.get('correspondence_type'),
                    'secrecy_level': correspondence.get('secrecy_level'),
                    'priority_level': correspondence.get('priority_level'),
                    'personality_level': correspondence.get('personality_level'),
                    'created_at': correspondence.get('created_at').isoformat() if correspondence.get('created_at') else None,
                }
            })
        
        return results
    
    def _build_correspondence_text(self, correspondence: Dict[str, Any]) -> str:
        """
        بناء النص الكامل من المراسلة
        
        Args:
            correspondence: بيانات المراسلة
            
        Returns:
            النص الكامل
        """
        parts = []
        
        parts.append(f"رقم الكتاب: {correspondence.get('mail_num', '')}")
        parts.append(f"التاريخ: {correspondence.get('mail_date', '')}")
        
        if correspondence.get('subject'):
            parts.append(f"الموضوع: {correspondence['subject']}")
        
        if correspondence.get('body_text'):
            parts.append(f"المحتوى: {correspondence['body_text']}")
        
        parts.append(f"نوع المراسلة: {correspondence.get('correspondence_type', '')}")
        parts.append(f"مستوى الأولوية: {correspondence.get('priority_level', '')}")
        parts.append(f"مستوى السرية: {correspondence.get('secrecy_level', '')}")
        
        if correspondence.get('external_reference_number'):
            parts.append(f"المرجع الخارجي: {correspondence['external_reference_number']}")
        
        return '\n\n'.join(parts)
    
    def get_dimension(self) -> int:
        """الحصول على dimension"""
        return self.dimension
    
    async def check_model_loaded(self) -> bool:
        """فحص إذا كان النموذج محمل"""
        return self.model is not None


# Create global embedding service instance
embedding_service = EmbeddingService()


__all__ = ["embedding_service", "EmbeddingService"]

