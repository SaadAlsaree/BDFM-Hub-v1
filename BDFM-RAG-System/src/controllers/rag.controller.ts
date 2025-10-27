import { Request, Response } from 'express';
import ragService from '../services/rag.service';
import syncService from '../services/sync.service';
import qdrantService from '../services/qdrant.service';
import config from '../config';
import logger from '../utils/logger';
import { SearchRequest, SyncRequest, ApiResponse } from '../models';

export class RAGController {
  /**
   * Query using RAG
   */
  async query(req: Request, res: Response): Promise<void> {
    try {
      const searchRequest: SearchRequest = {
        query: req.body.query,
        language: req.body.language || 'ar',
        maxResults: req.body.maxResults,
        similarityThreshold: req.body.similarityThreshold,
        filters: req.body.filters,
      };

      if (!searchRequest.query || searchRequest.query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Query is required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>);
        return;
      }

      logger.info(`Query request: ${searchRequest.query}`);

      const result = await ragService.query(searchRequest);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as ApiResponse<typeof result>);
    } catch (error: any) {
      logger.error('Error in query:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'QUERY_FAILED',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }
  }

  /**
   * Query with streaming
   */
  async queryStream(req: Request, res: Response): Promise<void> {
    try {
      const searchRequest: SearchRequest = {
        query: req.body.query,
        language: req.body.language || 'ar',
        maxResults: req.body.maxResults,
        similarityThreshold: req.body.similarityThreshold,
        filters: req.body.filters,
      };

      if (!searchRequest.query || searchRequest.query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Query is required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Streaming query request: ${searchRequest.query}`);

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream the response
      for await (const chunk of ragService.queryStream(searchRequest)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      res.end();
    } catch (error: any) {
      logger.error('Error in streaming query:', error);
      res.write(
        `data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`
      );
      res.end();
    }
  }

  /**
   * Search without LLM
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { query, maxResults, threshold, filters } = req.body;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Query is required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Search request: ${query}`);

      const results = await ragService.search(
        query,
        maxResults,
        threshold,
        filters
      );

      res.json({
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in search:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'SEARCH_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Sync correspondences
   */
  async sync(req: Request, res: Response): Promise<void> {
    try {
      const syncRequest: SyncRequest = {
        type: req.body.type || 'full',
        batchSize: req.body.batchSize,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
      };

      logger.info(`Sync request: ${syncRequest.type}`);

      const result = await syncService.syncCorrespondences(syncRequest);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in sync:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'SYNC_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Index single correspondence
   */
  async indexCorrespondence(req: Request, res: Response): Promise<void> {
    try {
      const { correspondenceId } = req.body;

      if (!correspondenceId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Correspondence ID is required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Index correspondence request: ${correspondenceId}`);

      const success =
        await syncService.syncSingleCorrespondence(correspondenceId);

      res.json({
        success,
        data: { correspondenceId, indexed: success },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error indexing correspondence:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'INDEX_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete correspondence from index
   */
  async deleteCorrespondence(req: Request, res: Response): Promise<void> {
    try {
      const { correspondenceId } = req.params;

      if (!correspondenceId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Correspondence ID is required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Delete correspondence request: ${correspondenceId}`);

      const success = await syncService.deleteCorrespondence(correspondenceId);

      res.json({
        success,
        data: { correspondenceId, deleted: success },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error deleting correspondence:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'DELETE_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get system status
   */
  async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      logger.info('Status request');

      const status = await ragService.getStatus();

      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error getting status:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'STATUS_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(_req: Request, res: Response): Promise<void> {
    try {
      logger.info('Sync statistics request');

      const stats = await syncService.getSyncStatistics();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error getting sync stats:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'STATS_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Rebuild index
   */
  async rebuildIndex(_req: Request, res: Response): Promise<void> {
    try {
      logger.info('Rebuild index request');

      const result = await syncService.rebuildIndex();

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error rebuilding index:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'REBUILD_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get all data from Qdrant collection
   */
  async getQdrantData(req: Request, res: Response): Promise<void> {
    try {
      const { collection } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      logger.info(`Getting data from Qdrant collection: ${collection}`);

      const result = await ragService.getQdrantData(
        collection,
        parseInt(limit as string, 10),
        parseInt(offset as string, 10)
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error getting Qdrant data:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'QDRANT_DATA_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(req: Request, res: Response): Promise<void> {
    try {
      const { collection } = req.params;

      logger.info(`Getting stats for collection: ${collection}`);

      const result = await ragService.getCollectionStats(collection);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error getting collection stats:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'COLLECTION_STATS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get all collections
   */
  async getAllCollections(_req: Request, res: Response): Promise<void> {
    try {
      logger.info('Getting all Qdrant collections');

      const result = await ragService.getAllCollections();

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error getting collections:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'COLLECTIONS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Remove duplicate embeddings
   */
  async removeDuplicates(_req: Request, res: Response): Promise<void> {
    try {
      logger.info('Starting duplicate removal process');

      const result = await syncService.removeDuplicates();

      res.json({
        success: result.success,
        data: {
          processed: result.processed,
          cleaned: result.cleaned,
          message: result.message,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error removing duplicates:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'REMOVE_DUPLICATES_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Fix collection dimensions
   */
  async fixDimensions(_req: Request, res: Response): Promise<void> {
    try {
      logger.info('Starting collection dimensions fix');

      // Get correct embedding dimension from config
      const correctDimension = config.rag.embeddingDimension;

      // Fix correspondence collection
      await qdrantService.fixCollectionDimensions(
        config.collections.correspondence,
        correctDimension
      );

      res.json({
        success: true,
        data: {
          message: `Collection dimensions fixed to ${correctDimension}`,
          dimension: correctDimension,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error fixing collection dimensions:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'FIX_DIMENSIONS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new RAGController();
