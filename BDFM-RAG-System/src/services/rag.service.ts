import embeddingService from './embedding.service';
import qdrantService from './qdrant.service';
import llmService from './llm.service';
import logger from '../utils/logger';
import config from '../config';
import { SearchRequest, RAGResponse, SearchResult } from '../models';
import { extractHighlights } from '../utils/helpers';

export class RAGService {
  /**
   * Query using RAG
   */
  async query(request: SearchRequest): Promise<RAGResponse> {
    const startTime = Date.now();
    let embeddingTime = 0;
    let searchTime = 0;
    let generationTime = 0;

    try {
      logger.info(`Processing RAG query: "${request.query}"`);

      // 1. Generate embedding for query
      const embeddingStart = Date.now();
      const queryEmbedding = await embeddingService.generateEmbedding(
        request.query
      );
      embeddingTime = Date.now() - embeddingStart;
      logger.debug(`Embedding generated in ${embeddingTime}ms`);

      // 2. Search similar documents in Qdrant
      const searchStart = Date.now();
      const similarDocs = await qdrantService.searchSimilar(
        config.collections.correspondence,
        queryEmbedding,
        request.maxResults || config.rag.maxResults,
        request.similarityThreshold || config.rag.similarityThreshold,
        request.filters
      );
      searchTime = Date.now() - searchStart;
      logger.debug(
        `Search completed in ${searchTime}ms, found ${similarDocs.length} results`
      );

      // 3. Check if we found any results
      if (similarDocs.length === 0) {
        const language = request.language || 'ar';
        return {
          answer:
            language === 'ar'
              ? 'لم أجد أي مراسلات مشابهة لاستفسارك. يرجى المحاولة بكلمات مختلفة أو أكثر تحديداً.'
              : 'I couldn\'t find any correspondence similar to your query. Please try different or more specific terms.',
          sources: [],
          language,
          metadata: {
            queryProcessingTime: Date.now() - startTime,
            embeddingTime,
            searchTime,
            generationTime: 0,
          },
        };
      }

      // 4. Add highlights to results
      const resultsWithHighlights = this.addHighlights(
        similarDocs,
        request.query
      );

      // 5. Generate answer using LLM
      const generationStart = Date.now();
      const answer = await llmService.generateAnswer(
        request.query,
        resultsWithHighlights,
        request.language || 'ar'
      );
      generationTime = Date.now() - generationStart;
      logger.debug(`Answer generated in ${generationTime}ms`);

      const totalTime = Date.now() - startTime;
      logger.info(
        `RAG query completed in ${totalTime}ms (embedding: ${embeddingTime}ms, search: ${searchTime}ms, generation: ${generationTime}ms)`
      );

      return {
        answer,
        sources: resultsWithHighlights,
        language: request.language || 'ar',
        metadata: {
          queryProcessingTime: totalTime,
          embeddingTime,
          searchTime,
          generationTime,
        },
      };
    } catch (error: any) {
      logger.error('Error processing RAG query:', error);
      throw new Error(`Failed to process query: ${error.message}`);
    }
  }

  /**
   * Query with streaming response
   */
  async *queryStream(request: SearchRequest): AsyncGenerator<any, void, unknown> {
    try {
      logger.info(`Processing streaming RAG query: "${request.query}"`);

      // 1. Generate embedding for query
      const queryEmbedding = await embeddingService.generateEmbedding(
        request.query
      );

      // 2. Search similar documents
      const similarDocs = await qdrantService.searchSimilar(
        config.collections.correspondence,
        queryEmbedding,
        request.maxResults || config.rag.maxResults,
        request.similarityThreshold || config.rag.similarityThreshold,
        request.filters
      );

      // 3. Check if we found any results
      if (similarDocs.length === 0) {
        const language = request.language || 'ar';
        yield {
          type: 'answer',
          content:
            language === 'ar'
              ? 'لم أجد أي مراسلات مشابهة لاستفسارك.'
              : 'I couldn\'t find any correspondence similar to your query.',
        };
        yield {
          type: 'sources',
          content: [],
        };
        return;
      }

      // 4. Add highlights
      const resultsWithHighlights = this.addHighlights(
        similarDocs,
        request.query
      );

      // 5. Send sources first
      yield {
        type: 'sources',
        content: resultsWithHighlights,
      };

      // 6. Stream answer
      yield {
        type: 'answer_start',
        content: '',
      };

      for await (const chunk of llmService.generateAnswerStream(
        request.query,
        resultsWithHighlights,
        request.language || 'ar'
      )) {
        yield {
          type: 'answer_chunk',
          content: chunk,
        };
      }

      yield {
        type: 'answer_end',
        content: '',
      };
    } catch (error: any) {
      logger.error('Error processing streaming RAG query:', error);
      yield {
        type: 'error',
        content: error.message,
      };
    }
  }

  /**
   * Search similar correspondences without LLM generation
   */
  async search(
    query: string,
    maxResults?: number,
    threshold?: number,
    filters?: any
  ): Promise<SearchResult[]> {
    try {
      logger.info(`Searching for: "${query}"`);

      // Generate embedding
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Search
      const results = await qdrantService.searchSimilar(
        config.collections.correspondence,
        queryEmbedding,
        maxResults || config.rag.maxResults,
        threshold || config.rag.similarityThreshold,
        filters
      );

      // Add highlights
      const resultsWithHighlights = this.addHighlights(results, query);

      logger.info(`Found ${resultsWithHighlights.length} similar results`);

      return resultsWithHighlights;
    } catch (error: any) {
      logger.error('Error searching:', error);
      throw new Error(`Failed to search: ${error.message}`);
    }
  }

  /**
   * Add highlights to search results
   */
  private addHighlights(
    results: SearchResult[],
    query: string
  ): SearchResult[] {
    return results.map((result) => ({
      ...result,
      highlights: extractHighlights(result.bodyText || result.subject, query),
    }));
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<any> {
    try {
      // Check Qdrant
      const qdrantConnected = await qdrantService.checkConnection();
      const collections = await qdrantService.getCollections();
      const collectionCounts: Record<string, number> = {};

      for (const collection of collections) {
        collectionCounts[collection] =
          await qdrantService.getCollectionCount(collection);
      }

      // Check Ollama
      const ollamaConnected = await embeddingService.checkConnection();
      const models = await embeddingService.getAvailableModels();

      // Check PostgreSQL
      const postgresConnected = await this.checkPostgresConnection();

      return {
        qdrant: {
          connected: qdrantConnected,
          collections: collectionCounts,
        },
        ollama: {
          connected: ollamaConnected,
          models,
          embeddingModel: config.ollama.embeddingModel,
          chatModel: config.ollama.chatModel,
        },
        postgres: {
          connected: postgresConnected,
        },
        config: {
          embeddingDimension: config.rag.embeddingDimension,
          chunkSize: config.rag.chunkSize,
          maxResults: config.rag.maxResults,
          similarityThreshold: config.rag.similarityThreshold,
        },
      };
    } catch (error: any) {
      logger.error('Error getting status:', error);
      throw error;
    }
  }

  /**
   * Get all data from Qdrant collection
   */
  async getQdrantData(
    collectionName: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any> {
    try {
      logger.info(`Getting data from collection: ${collectionName}`);

      const qdrantService = (await import('./qdrant.service')).default;

      // Get collection info
      const collectionInfo = await qdrantService.getCollectionInfo(collectionName);

      // Get points from collection
      const points = await (qdrantService as any).client.scroll(collectionName, {
        limit,
        offset,
        with_payload: true,
        with_vector: false, // Don't include vectors to reduce response size
      });

      return {
        collection: collectionName,
        totalPoints: collectionInfo.points_count || 0,
        returnedPoints: points.points.length,
        limit,
        offset,
        data: points.points.map((point: any) => ({
          id: point.id,
          payload: point.payload,
        })),
      };
    } catch (error: any) {
      logger.error(`Error getting data from collection ${collectionName}:`, error);
      throw new Error(`Failed to get data from collection: ${error.message}`);
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName: string): Promise<any> {
    try {
      logger.info(`Getting stats for collection: ${collectionName}`);

      const qdrantService = (await import('./qdrant.service')).default;

      const collectionInfo = await qdrantService.getCollectionInfo(collectionName);
      const count = await qdrantService.getCollectionCount(collectionName);

      return {
        collection: collectionName,
        pointsCount: count,
        vectorSize: collectionInfo.config?.params?.vectors?.size || 'unknown',
        distance: collectionInfo.config?.params?.vectors?.distance || 'unknown',
        status: collectionInfo.status || 'unknown',
        optimizerStatus: collectionInfo.optimizer_status || 'unknown',
        payloadSchema: collectionInfo.payload_schema || {},
        config: collectionInfo.config || {},
      };
    } catch (error: any) {
      logger.error(`Error getting stats for collection ${collectionName}:`, error);
      throw new Error(`Failed to get collection stats: ${error.message}`);
    }
  }

  /**
   * Get all collections
   */
  async getAllCollections(): Promise<any> {
    try {
      logger.info('Getting all Qdrant collections');

      const qdrantService = (await import('./qdrant.service')).default;

      const collections = await qdrantService.getCollections();

      // Get stats for each collection
      const collectionsWithStats = await Promise.all(
        collections.map(async (collectionName) => {
          try {
            const stats = await this.getCollectionStats(collectionName);
            return stats;
          } catch (error) {
            logger.warn(`Could not get stats for collection ${collectionName}:`, error);
            return {
              collection: collectionName,
              pointsCount: 0,
              vectorSize: 'unknown',
              distance: 'unknown',
              status: 'error',
              error: (error as Error).message,
            };
          }
        })
      );

      return {
        totalCollections: collections.length,
        collections: collectionsWithStats,
      };
    } catch (error: any) {
      logger.error('Error getting all collections:', error);
      throw new Error(`Failed to get collections: ${error.message}`);
    }
  }

  /**
   * Check PostgreSQL connection
   */
  private async checkPostgresConnection(): Promise<boolean> {
    try {
      const databaseService = (await import('./database.service')).default;
      return await databaseService.testConnection();
    } catch (error) {
      logger.error('Error checking PostgreSQL connection:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new RAGService();
