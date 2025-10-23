import { QdrantClient } from '@qdrant/js-client-rest';
import config from '../config';
import logger from '../utils/logger';
import { SearchResult, VectorEmbedding, SearchFilters } from '../models';

export class QdrantService {
  private client: QdrantClient;
  private initialized: boolean = false;

  constructor() {
    this.client = new QdrantClient({
      url: config.qdrant.url,
      apiKey: config.qdrant.apiKey,
    });
  }

  /**
   * Initialize Qdrant and create collections
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Qdrant service...');

      // Check if collections exist, create if not
      await this.ensureCollection(
        config.collections.correspondence,
        config.rag.embeddingDimension
      );
      await this.ensureCollection(
        config.collections.workflow,
        config.rag.embeddingDimension
      );
      await this.ensureCollection(
        config.collections.userGuide,
        config.rag.embeddingDimension
      );

      this.initialized = true;
      logger.info('Qdrant service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Qdrant service:', error);
      throw error;
    }
  }

  /**
   * Ensure collection exists
   */
  private async ensureCollection(
    collectionName: string,
    vectorSize: number
  ): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (col) => col.name === collectionName
      );

      if (!exists) {
        logger.info(`Creating collection: ${collectionName}`);
        await this.client.createCollection(collectionName, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          replication_factor: 1,
        });
        logger.info(`Collection created: ${collectionName}`);
      } else {
        logger.info(`Collection already exists: ${collectionName}`);
      }
    } catch (error) {
      logger.error(`Error ensuring collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Upsert embeddings to collection
   */
  async upsertEmbeddings(
    collectionName: string,
    embeddings: VectorEmbedding[]
  ): Promise<void> {
    try {
      const points = embeddings.map((emb) => ({
        id: emb.id,
        vector: emb.embeddingVector,
        payload: {
          correspondenceId: emb.correspondenceId,
          textChunk: emb.textChunk,
          modelName: emb.modelName,
          chunkIndex: emb.chunkIndex,
          language: emb.language,
          createdAt: emb.createdAt.toISOString(),
          ...emb.metadata,
        },
      }));

      await this.client.upsert(collectionName, {
        wait: true,
        points,
      });

      logger.info(
        `Upserted ${embeddings.length} embeddings to ${collectionName}`
      );
    } catch (error) {
      logger.error(`Error upserting embeddings to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Search similar vectors
   */
  async searchSimilar(
    collectionName: string,
    queryVector: number[],
    limit: number = 10,
    threshold: number = 0.7,
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    try {
      const filter = this.buildFilter(filters);

      const searchResult = await this.client.search(collectionName, {
        vector: queryVector,
        limit,
        score_threshold: threshold,
        with_payload: true,
        filter,
      });

      const results: SearchResult[] = searchResult.map((result) => ({
        id: result.payload?.correspondenceId as string,
        mailNum: result.payload?.mail_num as string,
        mailDate: result.payload?.mail_date as string,
        subject: result.payload?.subject as string,
        bodyText: result.payload?.body_text as string,
        correspondenceType: result.payload?.correspondence_type as string,
        secrecyLevel: result.payload?.secrecy_level as string,
        priorityLevel: result.payload?.priority_level as string,
        personalityLevel: result.payload?.personality_level as string,
        similarityScore: result.score,
      }));

      logger.info(
        `Found ${results.length} similar results in ${collectionName}`
      );
      return results;
    } catch (error) {
      logger.error(`Error searching in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete embeddings by correspondence ID
   */
  async deleteByCorrespondenceId(
    collectionName: string,
    correspondenceId: string
  ): Promise<void> {
    try {
      await this.client.delete(collectionName, {
        wait: true,
        filter: {
          must: [
            {
              key: 'correspondenceId',
              match: {
                value: correspondenceId,
              },
            },
          ],
        },
      });

      logger.info(
        `Deleted embeddings for correspondence ${correspondenceId} from ${collectionName}`
      );
    } catch (error) {
      logger.error(
        `Error deleting embeddings for ${correspondenceId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get collection info
   */
  async getCollectionInfo(collectionName: string): Promise<any> {
    try {
      return await this.client.getCollection(collectionName);
    } catch (error) {
      logger.error(`Error getting collection info for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get collection count
   */
  async getCollectionCount(collectionName: string): Promise<number> {
    try {
      const info = await this.getCollectionInfo(collectionName);
      return info.points_count || 0;
    } catch (error) {
      logger.error(`Error getting collection count for ${collectionName}:`, error);
      return 0;
    }
  }

  /**
   * Delete collection
   */
  async deleteCollection(collectionName: string): Promise<void> {
    try {
      await this.client.deleteCollection(collectionName);
      logger.info(`Deleted collection: ${collectionName}`);
    } catch (error) {
      logger.error(`Error deleting collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Build filter for search
   */
  private buildFilter(filters?: SearchFilters): any {
    if (!filters) return undefined;

    const must: any[] = [];

    if (filters.correspondenceType && filters.correspondenceType.length > 0) {
      must.push({
        key: 'correspondence_type',
        match: {
          any: filters.correspondenceType,
        },
      });
    }

    if (filters.priorityLevel && filters.priorityLevel.length > 0) {
      must.push({
        key: 'priority_level',
        match: {
          any: filters.priorityLevel,
        },
      });
    }

    if (filters.secrecyLevel && filters.secrecyLevel.length > 0) {
      must.push({
        key: 'secrecy_level',
        match: {
          any: filters.secrecyLevel,
        },
      });
    }

    if (filters.dateFrom) {
      must.push({
        key: 'mail_date',
        range: {
          gte: filters.dateFrom,
        },
      });
    }

    if (filters.dateTo) {
      must.push({
        key: 'mail_date',
        range: {
          lte: filters.dateTo,
        },
      });
    }

    if (filters.organizationalUnitId) {
      must.push({
        key: 'organizational_unit_id',
        match: {
          value: filters.organizationalUnitId,
        },
      });
    }

    return must.length > 0 ? { must } : undefined;
  }

  /**
   * Check connection
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.client.getCollections();
      return true;
    } catch (error) {
      logger.error('Qdrant connection check failed:', error);
      return false;
    }
  }

  /**
   * Get all collection names
   */
  async getCollections(): Promise<string[]> {
    try {
      const collections = await this.client.getCollections();
      return collections.collections.map((col) => col.name);
    } catch (error) {
      logger.error('Error getting collections:', error);
      return [];
    }
  }
}

// Export singleton instance
export default new QdrantService();
