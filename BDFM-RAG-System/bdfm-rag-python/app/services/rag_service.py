"""RAG service combining embedding, search, and LLM generation"""
from typing import List, Dict, Any, AsyncGenerator, Optional
import time
from app.config import settings
from app.utils.logger import logger
from app.utils.helpers import extract_highlights
from app.models import SearchRequest, QueryRequest, SearchResult, RAGResponse
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service
from app.services.llm_service import llm_service


class RAGService:
    """Service for complete RAG pipeline"""
    
    async def query(self, request: QueryRequest) -> RAGResponse:
        """
        RAG query كامل: embedding + search + LLM generation
        
        Args:
            request: RAG query request
            
        Returns:
            الإجابة المولدة مع المصادر
        """
        start_time = time.time()
        embedding_time = 0
        search_time = 0
        generation_time = 0
        
        try:
            logger.info(f"Processing RAG query: {request.query[:50]}...")
            
            # 1. Generate embedding for query
            embedding_start = time.time()
            query_embedding = await embedding_service.generate_embedding(
                request.query,
                is_query=True  # مهم لـ E5 models
            )
            embedding_time = (time.time() - embedding_start) * 1000
            logger.debug(f"Embedding generated in {embedding_time:.0f}ms")
            
            # 2. Search similar documents in Qdrant
            search_start = time.time()
            similar_docs = await qdrant_service.search_similar(
                settings.correspondence_collection,
                query_embedding,
                limit=request.max_results or settings.max_results,
                score_threshold=request.similarity_threshold or settings.similarity_threshold,
                filters=request.filters
            )
            search_time = (time.time() - search_start) * 1000
            logger.debug(f"Search completed in {search_time:.0f}ms, found {len(similar_docs)} results")
            
            # 3. Check if we found any results
            if not similar_docs:
                language = request.language or "ar"
                no_results_msg = (
                    "لم أجد أي مراسلات مشابهة لاستفسارك. يرجى المحاولة بكلمات مختلفة أو أكثر تحديداً."
                    if language == "ar"
                    else "I couldn't find any correspondence similar to your query. Please try different or more specific terms."
                )
                
                return RAGResponse(
                    answer=no_results_msg,
                    sources=[],
                    language=language,
                    metadata={
                        "query_processing_time": (time.time() - start_time) * 1000,
                        "embedding_time": embedding_time,
                        "search_time": search_time,
                        "generation_time": 0
                    }
                )
            
            # 4. Add highlights to results
            results_with_highlights = self._add_highlights(similar_docs, request.query)
            
            # 5. Generate answer using LLM
            generation_start = time.time()
            answer = await llm_service.generate_answer(
                request.query,
                results_with_highlights,
                request.language or "ar"
            )
            generation_time = (time.time() - generation_start) * 1000
            logger.debug(f"Answer generated in {generation_time:.0f}ms")
            
            total_time = (time.time() - start_time) * 1000
            logger.info(
                f"RAG query completed in {total_time:.0f}ms "
                f"(embedding: {embedding_time:.0f}ms, search: {search_time:.0f}ms, generation: {generation_time:.0f}ms)"
            )
            
            return RAGResponse(
                answer=answer,
                sources=results_with_highlights,
                language=request.language or "ar",
                metadata={
                    "query_processing_time": total_time,
                    "embedding_time": embedding_time,
                    "search_time": search_time,
                    "generation_time": generation_time
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing RAG query: {e}")
            raise
    
    async def query_stream(self, request: QueryRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """
        RAG query مع streaming response
        
        Args:
            request: RAG query request
            
        Yields:
            أجزاء الإجابة والمصادر
        """
        try:
            logger.info(f"Processing streaming RAG query: {request.query[:50]}...")
            
            # 1. Generate embedding for query
            query_embedding = await embedding_service.generate_embedding(
                request.query,
                is_query=True
            )
            
            # 2. Search similar documents
            similar_docs = await qdrant_service.search_similar(
                settings.correspondence_collection,
                query_embedding,
                limit=request.max_results or settings.max_results,
                score_threshold=request.similarity_threshold or settings.similarity_threshold,
                filters=request.filters
            )
            
            # 3. Check if we found results
            if not similar_docs:
                language = request.language or "ar"
                yield {
                    "type": "answer",
                    "content": (
                        "لم أجد أي مراسلات مشابهة لاستفسارك."
                        if language == "ar"
                        else "I couldn't find any correspondence similar to your query."
                    )
                }
                yield {
                    "type": "sources",
                    "content": []
                }
                return
            
            # 4. Add highlights
            results_with_highlights = self._add_highlights(similar_docs, request.query)
            
            # 5. Send sources first
            yield {
                "type": "sources",
                "content": [result.dict() for result in results_with_highlights]
            }
            
            # 6. Stream answer
            yield {
                "type": "answer_start",
                "content": ""
            }
            
            async for chunk in llm_service.generate_answer_stream(
                request.query,
                results_with_highlights,
                request.language or "ar"
            ):
                yield {
                    "type": "answer_chunk",
                    "content": chunk
                }
            
            yield {
                "type": "answer_end",
                "content": ""
            }
            
        except Exception as e:
            logger.error(f"Error processing streaming RAG query: {e}")
            yield {
                "type": "error",
                "content": str(e)
            }
    
    async def search(
        self,
        query: str,
        max_results: Optional[int] = None,
        threshold: Optional[float] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """
        بحث دلالي بدون LLM generation
        
        Args:
            query: الاستعلام
            max_results: عدد النتائج
            threshold: عتبة التشابه
            filters: فلاتر إضافية
            
        Returns:
            نتائج البحث
        """
        try:
            logger.info(f"Searching for: {query[:50]}...")
            
            # Generate embedding
            query_embedding = await embedding_service.generate_embedding(query, is_query=True)
            
            # Search
            results = await qdrant_service.search_similar(
                settings.correspondence_collection,
                query_embedding,
                limit=max_results or settings.max_results,
                score_threshold=threshold or settings.similarity_threshold,
                filters=filters
            )
            
            # Add highlights
            results_with_highlights = self._add_highlights(results, query)
            
            logger.info(f"Found {len(results_with_highlights)} similar results")
            
            return results_with_highlights
            
        except Exception as e:
            logger.error(f"Error searching: {e}")
            raise
    
    def _add_highlights(
        self,
        results: List[Dict[str, Any]],
        query: str
    ) -> List[SearchResult]:
        """
        إضافة highlights لنتائج البحث
        
        Args:
            results: نتائج البحث
            query: الاستعلام
            
        Returns:
            نتائج مع highlights
        """
        results_with_highlights = []
        
        for result in results:
            highlights = extract_highlights(
                result.get("body_text", "") or result.get("subject", ""),
                query
            )
            
            search_result = SearchResult(
                id=result["id"],
                mail_num=result["mail_num"],
                mail_date=result["mail_date"],
                subject=result["subject"],
                body_text=result["body_text"],
                correspondence_type=result["correspondence_type"],
                secrecy_level=result["secrecy_level"],
                priority_level=result["priority_level"],
                personality_level=result["personality_level"],
                similarity_score=result["similarity_score"],
                highlights=highlights
            )
            
            results_with_highlights.append(search_result)
        
        return results_with_highlights
    
    async def get_status(self) -> Dict[str, Any]:
        """
        الحصول على حالة النظام
        
        Returns:
            معلومات الحالة
        """
        try:
            # Check Qdrant
            qdrant_connected = await qdrant_service.check_connection()
            collections = await qdrant_service.get_collections()
            
            collection_counts = {}
            for collection in collections:
                count = await qdrant_service.get_collection_count(collection)
                collection_counts[collection] = count
            
            # Check Ollama
            ollama_connected = await llm_service.check_connection()
            
            # Check Embedding model
            embedding_loaded = await embedding_service.check_model_loaded()
            
            return {
                "qdrant": {
                    "connected": qdrant_connected,
                    "collections": collection_counts
                },
                "ollama": {
                    "connected": ollama_connected,
                    "chat_model": settings.ollama_chat_model
                },
                "embedding": {
                    "model": settings.embedding_model,
                    "dimension": settings.embedding_dimension,
                    "loaded": embedding_loaded
                },
                "config": {
                    "chunk_size": settings.chunk_size,
                    "max_results": settings.max_results,
                    "similarity_threshold": settings.similarity_threshold
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting status: {e}")
            raise


# Create global RAG service instance
rag_service = RAGService()


__all__ = ["rag_service", "RAGService"]

