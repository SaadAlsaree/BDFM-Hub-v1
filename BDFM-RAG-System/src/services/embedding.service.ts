import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { chunkText, sanitizeText } from '../utils/helpers';
import { VectorEmbedding, Correspondence, TextChunk } from '../models';
import { v4 as uuidv4 } from 'uuid';

export class EmbeddingService {
  private ollamaUrl: string;
  private model: string;

  constructor() {
    this.ollamaUrl = config.ollama.url;
    this.model = config.ollama.embeddingModel;
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const sanitized = sanitizeText(text);

      const response = await axios.post(
        `${this.ollamaUrl}/api/embeddings`,
        {
          model: this.model,
          prompt: sanitized,
        },
        {
          timeout: config.ollama.timeout,
        }
      );

      if (!response.data || !response.data.embedding) {
        throw new Error('Invalid response from Ollama embedding API');
      }

      logger.debug(`Generated embedding for text (length: ${text.length})`);
      return response.data.embedding;
    } catch (error: any) {
      logger.error('Error generating embedding:', error.message);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for correspondence
   */
  async generateEmbeddingsForCorrespondence(
    correspondence: Correspondence
  ): Promise<VectorEmbedding[]> {
    try {
      logger.info(
        `Generating embeddings for correspondence ${correspondence.id}`
      );

      // Combine all text fields
      const fullText = this.buildCorrespondenceText(correspondence);

      // Chunk the text
      const chunks = chunkText(
        fullText,
        config.rag.chunkSize,
        config.rag.chunkOverlap
      );

      logger.info(
        `Split correspondence into ${chunks.length} chunks`
      );

      // Generate embeddings for each chunk
      const embeddings: VectorEmbedding[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embeddingVector = await this.generateEmbedding(chunk);

        const embedding: VectorEmbedding = {
          id: uuidv4(),
          correspondenceId: correspondence.id,
          textChunk: chunk,
          embeddingVector,
          modelName: this.model,
          chunkIndex: i,
          language: this.detectLanguage(chunk),
          metadata: {
            correspondence_id: correspondence.id,
            mail_num: correspondence.mailNum,
            mail_date: correspondence.mailDate,
            subject: correspondence.subject,
            body_text: correspondence.bodyText,
            correspondence_type: correspondence.correspondenceType,
            secrecy_level: correspondence.secrecyLevel,
            priority_level: correspondence.priorityLevel,
            personality_level: correspondence.personalityLevel,
            created_at: correspondence.createdAt.toISOString(),
          },
          createdAt: new Date(),
        };

        embeddings.push(embedding);
      }

      logger.info(
        `Generated ${embeddings.length} embeddings for correspondence ${correspondence.id}`
      );

      return embeddings;
    } catch (error: any) {
      logger.error(
        `Error generating embeddings for correspondence ${correspondence.id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple correspondences
   */
  async generateBatchEmbeddings(
    correspondences: Correspondence[]
  ): Promise<Map<string, VectorEmbedding[]>> {
    const results = new Map<string, VectorEmbedding[]>();

    for (const correspondence of correspondences) {
      try {
        const embeddings =
          await this.generateEmbeddingsForCorrespondence(correspondence);
        results.set(correspondence.id, embeddings);
      } catch (error) {
        logger.error(
          `Failed to generate embeddings for correspondence ${correspondence.id}:`,
          error
        );
        // Continue with next correspondence
      }
    }

    return results;
  }

  /**
   * Build full text from correspondence
   */
  private buildCorrespondenceText(correspondence: Correspondence): string {
    const parts: string[] = [];

    // Add mail number and date
    parts.push(`رقم الكتاب: ${correspondence.mailNum}`);
    parts.push(`التاريخ: ${correspondence.mailDate}`);

    // Add subject
    if (correspondence.subject) {
      parts.push(`الموضوع: ${correspondence.subject}`);
    }

    // Add body
    if (correspondence.bodyText) {
      parts.push(`المحتوى: ${correspondence.bodyText}`);
    }

    // Add metadata
    parts.push(`نوع المراسلة: ${correspondence.correspondenceType}`);
    parts.push(`مستوى الأولوية: ${correspondence.priorityLevel}`);
    parts.push(`مستوى السرية: ${correspondence.secrecyLevel}`);

    // Add external reference if exists
    if (correspondence.externalReferenceNumber) {
      parts.push(
        `المرجع الخارجي: ${correspondence.externalReferenceNumber}`
      );
    }

    return parts.join('\n\n');
  }

  /**
   * Detect language of text (simple heuristic)
   */
  private detectLanguage(text: string): string {
    // Check for Arabic characters
    const arabicRegex = /[\u0600-\u06FF]/;
    if (arabicRegex.test(text)) {
      return 'ar';
    }
    return 'en';
  }

  /**
   * Check if Ollama is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      logger.error('Ollama connection check failed:', error);
      return false;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 5000,
      });

      if (response.data && response.data.models) {
        return response.data.models.map((m: any) => m.name);
      }

      return [];
    } catch (error) {
      logger.error('Error getting available models:', error);
      return [];
    }
  }

  /**
   * Verify embedding model is available
   */
  async verifyModel(): Promise<boolean> {
    try {
      const models = await this.getAvailableModels();
      const isAvailable = models.includes(this.model);

      if (!isAvailable) {
        logger.warn(
          `Embedding model ${this.model} is not available. Available models: ${models.join(', ')}`
        );
      }

      return isAvailable;
    } catch (error) {
      logger.error('Error verifying embedding model:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new EmbeddingService();
