import embeddingService from './embedding.service';
import qdrantService from './qdrant.service';
import llmService from './llm.service';
import conversationService from './conversation.service';
import logger from '../utils/logger';
import config from '../config';
import { SendMessageRequest, ConversationMessage } from '../models';

export class ConversationRAGService {
  /**
   * Send message in conversation
   */
  async sendMessage(request: SendMessageRequest): Promise<ConversationMessage> {
    const startTime = Date.now();
    let embeddingTime = 0;
    let searchTime = 0;
    let generationTime = 0;

    try {
      logger.info(
        `Processing message in conversation ${request.conversationId} for user ${request.userId}`
      );

      // Verify conversation belongs to user
      const conversation = await conversationService.getConversation(
        request.conversationId,
        request.userId
      );

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      // Add user message
      await conversationService.addMessage(
        request.conversationId,
        'user',
        request.message
      );

      // 1. Generate embedding for query
      const embeddingStart = Date.now();
      const queryEmbedding = await embeddingService.generateEmbedding(
        request.message
      );
      embeddingTime = Date.now() - embeddingStart;

      // 2. Search similar documents
      const searchStart = Date.now();
      const similarDocs = await qdrantService.searchSimilar(
        config.collections.correspondence,
        queryEmbedding,
        request.maxResults || config.rag.maxResults,
        request.similarityThreshold || config.rag.similarityThreshold,
        request.filters
      );
      searchTime = Date.now() - searchStart;

      // 3. Check if we found results
      if (similarDocs.length === 0) {
        const answer =
          conversation.language === 'ar'
            ? 'لم أجد أي مراسلات مشابهة لاستفسارك. يرجى المحاولة بكلمات مختلفة أو أكثر تحديداً.'
            : 'I couldn\'t find any correspondence similar to your query.';

        const assistantMessage = await conversationService.addMessage(
          request.conversationId,
          'assistant',
          answer,
          [],
          {
            queryProcessingTime: Date.now() - startTime,
            embeddingTime,
            searchTime,
            generationTime: 0,
          }
        );

        return assistantMessage;
      }

      // 4. Get conversation context
      const context = await conversationService.getConversationContext(
        request.conversationId,
        5 // Last 5 messages
      );

      // 5. Generate answer with context
      const generationStart = Date.now();
      const answer = await llmService.generateAnswerWithConversationContext(
        request.message,
        similarDocs,
        context,
        conversation.language
      );
      generationTime = Date.now() - generationStart;

      // 6. Add assistant message
      const totalTime = Date.now() - startTime;
      const assistantMessage = await conversationService.addMessage(
        request.conversationId,
        'assistant',
        answer,
        similarDocs,
        {
          queryProcessingTime: totalTime,
          embeddingTime,
          searchTime,
          generationTime,
        }
      );

      logger.info(
        `Message processed in ${totalTime}ms (embedding: ${embeddingTime}ms, search: ${searchTime}ms, generation: ${generationTime}ms)`
      );

      return assistantMessage;
    } catch (error: any) {
      logger.error('Error processing message:', error);
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }

  /**
   * Send message with streaming
   */
  async *sendMessageStream(
    request: SendMessageRequest
  ): AsyncGenerator<any, void, unknown> {
    try {
      logger.info(
        `Processing streaming message in conversation ${request.conversationId}`
      );

      // Verify conversation
      const conversation = await conversationService.getConversation(
        request.conversationId,
        request.userId
      );

      if (!conversation) {
        yield {
          type: 'error',
          content: 'Conversation not found or access denied',
        };
        return;
      }

      // Add user message
      await conversationService.addMessage(
        request.conversationId,
        'user',
        request.message
      );

      // Generate embedding
      const queryEmbedding = await embeddingService.generateEmbedding(
        request.message
      );

      // Search similar documents
      const similarDocs = await qdrantService.searchSimilar(
        config.collections.correspondence,
        queryEmbedding,
        request.maxResults || config.rag.maxResults,
        request.similarityThreshold || config.rag.similarityThreshold,
        request.filters
      );

      if (similarDocs.length === 0) {
        const answer =
          conversation.language === 'ar'
            ? 'لم أجد أي مراسلات مشابهة لاستفسارك.'
            : 'I couldn\'t find any correspondence similar to your query.';

        await conversationService.addMessage(
          request.conversationId,
          'assistant',
          answer,
          [],
          {}
        );

        yield {
          type: 'answer',
          content: answer,
        };
        return;
      }

      // Send sources
      yield {
        type: 'sources',
        content: similarDocs,
      };

      // Get conversation context
      const context = await conversationService.getConversationContext(
        request.conversationId,
        5
      );

      // Stream answer
      yield {
        type: 'answer_start',
        content: '',
      };

      let fullAnswer = '';
      for await (const chunk of llmService.generateAnswerStreamWithConversationContext(
        request.message,
        similarDocs,
        context,
        conversation.language
      )) {
        fullAnswer += chunk;
        yield {
          type: 'answer_chunk',
          content: chunk,
        };
      }

      yield {
        type: 'answer_end',
        content: '',
      };

      // Save complete answer
      await conversationService.addMessage(
        request.conversationId,
        'assistant',
        fullAnswer,
        similarDocs,
        {}
      );
    } catch (error: any) {
      logger.error('Error processing streaming message:', error);
      yield {
        type: 'error',
        content: error.message,
      };
    }
  }
}

// Export singleton instance
export default new ConversationRAGService();
