"""Qdrant vector database service"""
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    Range,
)
from typing import List, Dict, Any, Optional
from app.config import settings
from app.utils.logger import logger


class QdrantService:
    """Service for interacting with Qdrant vector database"""
    
    def __init__(self):
        self.client: Optional[QdrantClient] = None
        self.dimension = settings.embedding_dimension
        
    def initialize(self):
        """Initialize Qdrant client and create collections"""
        try:
            logger.info(f"Connecting to Qdrant at {settings.qdrant_url}")
            
            self.client = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
                timeout=60,
                # Older Qdrant servers may be incompatible with newer clients; skip strict check
                check_compatibility=False,
                prefer_grpc=False,
            )
            
            logger.info("Qdrant client initialized successfully")
            
            # Create collections if they don't exist
            self._create_collections()
            
        except Exception as e:
            logger.error(f"Error initializing Qdrant: {e}")
            raise
    
    def _create_collections(self):
        """Create Qdrant collections if they don't exist"""
        collections = [
            settings.correspondence_collection,
            settings.workflow_collection,
            settings.user_guide_collection,
        ]
        
        for collection_name in collections:
            try:
                # Check if collection exists (compat with older Qdrant servers)
                if not self._collection_exists_compat(collection_name):
                    logger.info(f"Creating collection: {collection_name}")
                    
                    self.client.create_collection(
                        collection_name=collection_name,
                        vectors_config=VectorParams(
                            size=self.dimension,
                            distance=Distance.COSINE,
                        ),
                    )
                    
                    logger.info(f"Collection {collection_name} created successfully")
                else:
                    logger.info(f"Collection {collection_name} already exists")
                    
            except Exception as e:
                logger.error(f"Error creating collection {collection_name}: {e}")
                raise

    def _collection_exists_compat(self, collection_name: str) -> bool:
        """Check if a collection exists, compatible with older Qdrant servers.

        Some older server versions do not support the dedicated
        collection_exists endpoint and will return 404 for it. In that case,
        attempt to fetch collection info and treat 404 as non-existence.
        """
        try:
            # Preferred quick path where supported
            if hasattr(self.client, "collection_exists"):
                try:
                    return bool(self.client.collection_exists(collection_name))
                except UnexpectedResponse as ex:
                    # Fall back on 404 from older server implementations
                    # UnexpectedResponse doesn't always expose status code; rely on message
                    message = str(ex).lower()
                    if "404" in message or "not found" in message:
                        return False
                    raise

            # Fallback: try get_collection
            self.client.get_collection(collection_name)
            return True
        except UnexpectedResponse as ex:
            message = str(ex).lower()
            if "404" in message or "not found" in message:
                return False
            raise
        except Exception as ex:
            message = str(ex).lower()
            if "404" in message or "not found" in message:
                return False
            # Unknown error should propagate
            raise
    
    async def upsert_embeddings(
        self,
        collection_name: str,
        embeddings: List[Dict[str, Any]]
    ) -> bool:
        """
        إضافة أو تحديث embeddings في Qdrant
        
        Args:
            collection_name: اسم الـ collection
            embeddings: قائمة embeddings
            
        Returns:
            True if successful
        """
        try:
            if not embeddings:
                return True
            
            points = []
            for emb in embeddings:
                point = PointStruct(
                    id=emb['id'],
                    vector=emb['embedding_vector'],
                    payload={
                        'correspondence_id': emb['correspondence_id'],
                        'text_chunk': emb['text_chunk'],
                        'chunk_index': emb['chunk_index'],
                        **emb['metadata']
                    }
                )
                points.append(point)
            
            self.client.upsert(
                collection_name=collection_name,
                points=points
            )
            
            logger.debug(f"Upserted {len(points)} points to {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error upserting embeddings: {e}")
            raise
    
    async def search_similar(
        self,
        collection_name: str,
        query_vector: List[float],
        limit: int = 10,
        score_threshold: float = 0.7,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        البحث عن embeddings مشابهة
        
        Args:
            collection_name: اسم الـ collection
            query_vector: vector الاستعلام
            limit: عدد النتائج
            score_threshold: عتبة التشابه
            filters: فلاتر إضافية
            
        Returns:
            قائمة النتائج
        """
        try:
            # Build filter if provided
            query_filter = None
            if filters:
                query_filter = self._build_filter(filters)
            
            # Search
            results = self.client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold,
                query_filter=query_filter,
            )
            
            # Convert to dict format
            search_results = []
            for result in results:
                search_results.append({
                    'id': result.payload.get('correspondence_id'),
                    'mail_num': result.payload.get('mail_num'),
                    'mail_date': result.payload.get('mail_date'),
                    'subject': result.payload.get('subject'),
                    'body_text': result.payload.get('text_chunk', ''),
                    'correspondence_type': result.payload.get('correspondence_type'),
                    'secrecy_level': result.payload.get('secrecy_level'),
                    'priority_level': result.payload.get('priority_level'),
                    'personality_level': result.payload.get('personality_level'),
                    'similarity_score': result.score,
                })
            
            logger.debug(f"Found {len(search_results)} results in {collection_name}")
            return search_results
            
        except Exception as e:
            logger.error(f"Error searching in Qdrant: {e}")
            raise
    
    def _build_filter(self, filters: Dict[str, Any]) -> Filter:
        """بناء Qdrant filter من dictionary"""
        conditions = []
        
        if filters.get('correspondence_type'):
            conditions.append(
                FieldCondition(
                    key="correspondence_type",
                    match=MatchValue(value=filters['correspondence_type'])
                )
            )
        
        if filters.get('priority_level'):
            conditions.append(
                FieldCondition(
                    key="priority_level",
                    match=MatchValue(value=filters['priority_level'])
                )
            )
        
        # يمكن إضافة المزيد من الشروط هنا
        
        if conditions:
            return Filter(must=conditions)
        
        return None
    
    async def delete_by_correspondence_id(
        self,
        collection_name: str,
        correspondence_id: str
    ) -> bool:
        """
        حذف embeddings لمراسلة معينة
        
        Args:
            collection_name: اسم الـ collection
            correspondence_id: معرف المراسلة
            
        Returns:
            True if successful
        """
        try:
            self.client.delete(
                collection_name=collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="correspondence_id",
                            match=MatchValue(value=correspondence_id)
                        )
                    ]
                )
            )
            
            logger.debug(f"Deleted embeddings for correspondence {correspondence_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting from Qdrant: {e}")
            raise
    
    async def get_collection_count(self, collection_name: str) -> int:
        """Get count of points in collection"""
        try:
            collection_info = self.client.get_collection(collection_name)
            return collection_info.points_count
        except Exception as e:
            logger.error(f"Error getting collection count: {e}")
            return 0
    
    async def get_collection_info(self, collection_name: str) -> Dict[str, Any]:
        """Get collection information"""
        try:
            collection_info = self.client.get_collection(collection_name)
            return {
                'name': collection_name,
                'points_count': collection_info.points_count,
                'vector_size': collection_info.config.params.vectors.size,
                'distance': collection_info.config.params.vectors.distance,
                'status': collection_info.status,
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {e}")
            raise
    
    async def get_collections(self) -> List[str]:
        """Get list of all collections"""
        try:
            collections = self.client.get_collections()
            return [col.name for col in collections.collections]
        except Exception as e:
            logger.error(f"Error getting collections: {e}")
            return []
    
    async def delete_collection(self, collection_name: str) -> bool:
        """Delete a collection"""
        try:
            self.client.delete_collection(collection_name)
            logger.info(f"Deleted collection: {collection_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
            return False
    
    async def check_connection(self) -> bool:
        """Check Qdrant connection"""
        try:
            collections = self.client.get_collections()
            return True
        except Exception as e:
            logger.error(f"Qdrant connection check failed: {e}")
            return False


# Create global qdrant service instance
qdrant_service = QdrantService()


__all__ = ["qdrant_service", "QdrantService"]

