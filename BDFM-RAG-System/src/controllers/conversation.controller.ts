import { Request, Response } from 'express';
import conversationService from '../services/conversation.service';
import conversationRAGService from '../services/conversation-rag.service';
import logger from '../utils/logger';
import {
  CreateConversationRequest,
  SendMessageRequest,
  ApiResponse,
} from '../models';

export class ConversationController {
  /**
   * Create new conversation
   */
  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateConversationRequest = {
        userId: req.body.userId,
        title: req.body.title,
        language: req.body.language || 'ar',
      };

      if (!request.userId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'User ID is required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>);
        return;
      }

      logger.info(`Creating conversation for user ${request.userId}`);

      const conversation =
        await conversationService.createConversation(request);

      res.json({
        success: true,
        data: conversation,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error creating conversation:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'CREATE_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * List user conversations
   */
  async listConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'User ID is required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Listing conversations for user ${userId}`);

      const conversations = await conversationService.listConversations({
        userId,
        limit,
        offset,
      });

      res.json({
        success: true,
        data: conversations,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error listing conversations:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'LIST_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get conversation with messages
   */
  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const conversationId = req.params.id;
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'User ID is required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Getting conversation ${conversationId} for user ${userId}`);

      const conversation =
        await conversationService.getConversationWithMessages(
          conversationId,
          userId
        );

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Conversation not found',
            code: 'NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: conversation,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error getting conversation:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'GET_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send message in conversation
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const request: SendMessageRequest = {
        conversationId: req.body.conversationId,
        userId: req.body.userId,
        message: req.body.message,
        maxResults: req.body.maxResults,
        similarityThreshold: req.body.similarityThreshold,
        filters: req.body.filters,
      };

      if (!request.conversationId || !request.userId || !request.message) {
        res.status(400).json({
          success: false,
          error: {
            message:
              'Conversation ID, User ID, and message are required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(
        `Sending message in conversation ${request.conversationId}`
      );

      const assistantMessage =
        await conversationRAGService.sendMessage(request);

      res.json({
        success: true,
        data: assistantMessage,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'SEND_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send message with streaming
   */
  async sendMessageStream(req: Request, res: Response): Promise<void> {
    try {
      const request: SendMessageRequest = {
        conversationId: req.body.conversationId,
        userId: req.body.userId,
        message: req.body.message,
        maxResults: req.body.maxResults,
        similarityThreshold: req.body.similarityThreshold,
        filters: req.body.filters,
      };

      if (!request.conversationId || !request.userId || !request.message) {
        res.status(400).json({
          success: false,
          error: {
            message:
              'Conversation ID, User ID, and message are required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(
        `Sending streaming message in conversation ${request.conversationId}`
      );

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream the response
      for await (const chunk of conversationRAGService.sendMessageStream(
        request
      )) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      res.end();
    } catch (error: any) {
      logger.error('Error sending streaming message:', error);
      res.write(
        `data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`
      );
      res.end();
    }
  }

  /**
   * Update conversation title
   */
  async updateTitle(req: Request, res: Response): Promise<void> {
    try {
      const conversationId = req.params.id;
      const userId = req.body.userId;
      const title = req.body.title;

      if (!userId || !title) {
        res.status(400).json({
          success: false,
          error: {
            message: 'User ID and title are required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Updating conversation ${conversationId} title`);

      const success = await conversationService.updateConversationTitle(
        conversationId,
        userId,
        title
      );

      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Conversation not found',
            code: 'NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: { conversationId, title },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error updating conversation title:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'UPDATE_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const conversationId = req.params.id;
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'User ID is required',
            code: 'INVALID_REQUEST',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Deleting conversation ${conversationId}`);

      const success = await conversationService.deleteConversation(
        conversationId,
        userId
      );

      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Conversation not found',
            code: 'NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: { conversationId, deleted: true },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error deleting conversation:', error);
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
}

export default new ConversationController();
