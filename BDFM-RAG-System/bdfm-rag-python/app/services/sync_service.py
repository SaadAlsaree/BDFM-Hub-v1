"""Sync service for syncing correspondences from PostgreSQL to Qdrant"""
from typing import Dict, Any, List
import time
from datetime import datetime
from app.config import settings
from app.utils.logger import logger
from app.utils.helpers import format_duration
from app.models import SyncRequest, SyncResult
from app.database.postgres import database_service
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service


class SyncService:
    """Service for syncing correspondences to Qdrant"""
    
    async def sync_correspondences(self, request: SyncRequest) -> SyncResult:
        """
        مزامنة المراسلات من PostgreSQL إلى Qdrant
        
        Args:
            request: sync request
            
        Returns:
            نتيجة المزامنة
        """
        start_time = time.time()
        synced = 0
        failed = 0
        errors = []
        
        try:
            logger.info(f"Starting {request.type} sync with batch size {request.batch_size}")
            
            # Get correspondences based on sync type
            if request.type == "incremental" and request.from_date:
                since_date = datetime.fromisoformat(request.from_date)
                correspondences = await database_service.get_correspondences_since(since_date)
                logger.info(f"Found {len(correspondences)} correspondences updated since {request.from_date}")
            else:
                # Full sync - get all correspondences in batches
                batch_size = request.batch_size or 100
                correspondences = []
                offset = 0
                has_more = True
                
                while has_more:
                    batch = await database_service.get_all_correspondences(batch_size, offset)
                    if not batch:
                        has_more = False
                    else:
                        correspondences.extend(batch)
                        offset += batch_size
                        logger.info(f"Fetched batch: {len(batch)} correspondences (total: {len(correspondences)})")
            
            logger.info(f"Processing {len(correspondences)} correspondences for embedding")
            
            # Process in batches
            batch_size = request.batch_size or 100
            total_batches = (len(correspondences) + batch_size - 1) // batch_size
            
            for i in range(0, len(correspondences), batch_size):
                batch = correspondences[i:i + batch_size]
                current_batch = i // batch_size + 1
                
                logger.info(f"Processing batch {current_batch}/{total_batches} ({len(batch)} items)")
                
                try:
                    await self._process_batch(batch)
                    synced += len(batch)
                except Exception as e:
                    logger.error(f"Error processing batch {current_batch}: {e}")
                    failed += len(batch)
                    errors.append(f"Batch {current_batch}: {str(e)}")
            
            duration = time.time() - start_time
            
            logger.info(f"Sync completed: {synced} synced, {failed} failed, duration: {format_duration(duration * 1000)}")
            
            return SyncResult(
                success=failed == 0,
                synced=synced,
                failed=failed,
                duration=format_duration(duration * 1000),
                errors=errors if errors else None
            )
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"Fatal error during sync: {e}")
            
            return SyncResult(
                success=False,
                synced=synced,
                failed=failed + 1,
                duration=format_duration(duration * 1000),
                errors=[str(e)]
            )
    
    async def _process_batch(self, correspondences: List[Dict[str, Any]]):
        """معالجة دفعة من المراسلات"""
        for correspondence in correspondences:
            try:
                # Delete old embeddings first
                await qdrant_service.delete_by_correspondence_id(
                    settings.correspondence_collection,
                    correspondence["id"]
                )
                
                # Generate embeddings
                embeddings = await embedding_service.generate_embeddings_for_correspondence(correspondence)
                
                # Upsert to Qdrant
                await qdrant_service.upsert_embeddings(
                    settings.correspondence_collection,
                    embeddings
                )
                
                logger.debug(f"Synced correspondence {correspondence['id']} ({correspondence['mail_num']})")
                
            except Exception as e:
                logger.error(f"Error syncing correspondence {correspondence['id']}: {e}")
                raise
    
    async def sync_single_correspondence(self, correspondence_id: str) -> bool:
        """مزامنة مراسلة واحدة"""
        try:
            logger.info(f"Syncing single correspondence: {correspondence_id}")
            
            correspondence = await database_service.get_correspondence_by_id(correspondence_id)
            
            if not correspondence:
                logger.warn(f"Correspondence {correspondence_id} not found")
                return False
            
            # Delete old embeddings
            await qdrant_service.delete_by_correspondence_id(
                settings.correspondence_collection,
                correspondence_id
            )
            
            # Generate embeddings
            embeddings = await embedding_service.generate_embeddings_for_correspondence(correspondence)
            
            # Upsert to Qdrant
            await qdrant_service.upsert_embeddings(
                settings.correspondence_collection,
                embeddings
            )
            
            logger.info(f"Successfully synced correspondence {correspondence_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error syncing correspondence {correspondence_id}: {e}")
            return False
    
    async def delete_correspondence(self, correspondence_id: str) -> bool:
        """حذف مراسلة من Qdrant"""
        try:
            logger.info(f"Deleting correspondence {correspondence_id} from Qdrant")
            
            await qdrant_service.delete_by_correspondence_id(
                settings.correspondence_collection,
                correspondence_id
            )
            
            logger.info(f"Successfully deleted correspondence {correspondence_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting correspondence {correspondence_id}: {e}")
            return False
    
    async def get_sync_statistics(self) -> Dict[str, Any]:
        """الحصول على إحصائيات المزامنة"""
        try:
            postgres_count = await database_service.get_correspondence_count()
            qdrant_count = await qdrant_service.get_collection_count(settings.correspondence_collection)
            
            return {
                "postgresql": {
                    "total": postgres_count
                },
                "qdrant": {
                    "total": qdrant_count
                },
                "synced": min(postgres_count, qdrant_count),
                "pending": max(0, postgres_count - qdrant_count)
            }
            
        except Exception as e:
            logger.error(f"Error getting sync statistics: {e}")
            raise
    
    async def rebuild_index(self) -> SyncResult:
        """إعادة بناء الفهرس من الصفر"""
        try:
            logger.info("Rebuilding index: deleting collection...")
            
            # Delete and recreate collection
            await qdrant_service.delete_collection(settings.correspondence_collection)
            qdrant_service.initialize()
            
            logger.info("Collection recreated, starting full sync...")
            
            # Perform full sync
            return await self.sync_correspondences(
                SyncRequest(type="full", batch_size=100)
            )
            
        except Exception as e:
            logger.error(f"Error rebuilding index: {e}")
            raise


# Create global sync service instance
sync_service = SyncService()


__all__ = ["sync_service", "SyncService"]

