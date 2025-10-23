import databaseService from './database.service';
import embeddingService from './embedding.service';
import qdrantService from './qdrant.service';
import logger from '../utils/logger';
import config from '../config';
import { SyncRequest, SyncResult, Correspondence } from '../models';
import { formatDuration } from '../utils/helpers';

export class SyncService {
  /**
   * Synchronize correspondences from PostgreSQL to Qdrant
   */
  async syncCorrespondences(request: SyncRequest): Promise<SyncResult> {
    const startTime = Date.now();
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      logger.info(
        `Starting ${request.type} sync of correspondences with batch size ${request.batchSize || 100}`
      );

      // Get correspondences based on sync type
      let correspondences: Correspondence[];

      if (request.type === 'incremental' && request.fromDate) {
        const sinceDate = new Date(request.fromDate);
        correspondences = await databaseService.getCorrespondencesSince(
          sinceDate
        );
        logger.info(
          `Found ${correspondences.length} correspondences updated since ${request.fromDate}`
        );
      } else {
        // Full sync - get all correspondences in batches
        const batchSize = request.batchSize || 100;
        correspondences = [];
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const batch = await databaseService.getAllCorrespondences(
            batchSize,
            offset
          );

          if (batch.length === 0) {
            hasMore = false;
          } else {
            correspondences.push(...batch);
            offset += batchSize;
            logger.info(
              `Fetched batch: ${batch.length} correspondences (total: ${correspondences.length})`
            );
          }
        }
      }

      logger.info(
        `Processing ${correspondences.length} correspondences for embedding`
      );

      // Process in batches
      const batchSize = request.batchSize || 100;
      const totalBatches = Math.ceil(correspondences.length / batchSize);

      for (let i = 0; i < correspondences.length; i += batchSize) {
        const batch = correspondences.slice(i, i + batchSize);
        const currentBatch = Math.floor(i / batchSize) + 1;

        logger.info(
          `Processing batch ${currentBatch}/${totalBatches} (${batch.length} items)`
        );

        try {
          await this.processBatch(batch);
          synced += batch.length;
        } catch (error: any) {
          logger.error(`Error processing batch ${currentBatch}:`, error);
          failed += batch.length;
          errors.push(
            `Batch ${currentBatch}: ${error.message || 'Unknown error'}`
          );
        }
      }

      const duration = Date.now() - startTime;

      logger.info(
        `Sync completed: ${synced} synced, ${failed} failed, duration: ${formatDuration(duration)}`
      );

      return {
        success: failed === 0,
        synced,
        failed,
        duration: formatDuration(duration),
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('Fatal error during sync:', error);

      return {
        success: false,
        synced,
        failed: failed + 1,
        duration: formatDuration(duration),
        errors: [error.message || 'Unknown fatal error'],
      };
    }
  }

  /**
   * Process a batch of correspondences
   */
  private async processBatch(correspondences: Correspondence[]): Promise<void> {
    for (const correspondence of correspondences) {
      try {
        // Generate embeddings
        const embeddings =
          await embeddingService.generateEmbeddingsForCorrespondence(
            correspondence
          );

        // Upsert to Qdrant
        await qdrantService.upsertEmbeddings(
          config.collections.correspondence,
          embeddings
        );

        logger.debug(
          `Synced correspondence ${correspondence.id} (${correspondence.mailNum})`
        );
      } catch (error: any) {
        logger.error(
          `Error syncing correspondence ${correspondence.id}:`,
          error
        );
        throw error; // Re-throw to be caught by batch handler
      }
    }
  }

  /**
   * Sync a single correspondence
   */
  async syncSingleCorrespondence(correspondenceId: string): Promise<boolean> {
    try {
      logger.info(`Syncing single correspondence: ${correspondenceId}`);

      const correspondence =
        await databaseService.getCorrespondenceById(correspondenceId);

      if (!correspondence) {
        logger.warn(`Correspondence ${correspondenceId} not found`);
        return false;
      }

      // Generate embeddings
      const embeddings =
        await embeddingService.generateEmbeddingsForCorrespondence(
          correspondence
        );

      // Upsert to Qdrant
      await qdrantService.upsertEmbeddings(
        config.collections.correspondence,
        embeddings
      );

      logger.info(`Successfully synced correspondence ${correspondenceId}`);
      return true;
    } catch (error) {
      logger.error(`Error syncing correspondence ${correspondenceId}:`, error);
      return false;
    }
  }

  /**
   * Delete correspondence from Qdrant
   */
  async deleteCorrespondence(correspondenceId: string): Promise<boolean> {
    try {
      logger.info(`Deleting correspondence ${correspondenceId} from Qdrant`);

      await qdrantService.deleteByCorrespondenceId(
        config.collections.correspondence,
        correspondenceId
      );

      logger.info(`Successfully deleted correspondence ${correspondenceId}`);
      return true;
    } catch (error) {
      logger.error(
        `Error deleting correspondence ${correspondenceId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(): Promise<any> {
    try {
      const postgresCount = await databaseService.getCorrespondenceCount();
      const qdrantCount = await qdrantService.getCollectionCount(
        config.collections.correspondence
      );

      return {
        postgresql: {
          total: postgresCount,
        },
        qdrant: {
          total: qdrantCount,
        },
        synced: Math.min(postgresCount, qdrantCount),
        pending: Math.max(0, postgresCount - qdrantCount),
      };
    } catch (error) {
      logger.error('Error getting sync statistics:', error);
      throw error;
    }
  }

  /**
   * Rebuild index (delete and re-sync all)
   */
  async rebuildIndex(): Promise<SyncResult> {
    try {
      logger.info('Rebuilding index: deleting collection...');

      // Delete and recreate collection
      await qdrantService.deleteCollection(config.collections.correspondence);
      await qdrantService.initialize();

      logger.info('Collection recreated, starting full sync...');

      // Perform full sync
      return await this.syncCorrespondences({
        type: 'full',
        batchSize: 100,
      });
    } catch (error: any) {
      logger.error('Error rebuilding index:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new SyncService();
