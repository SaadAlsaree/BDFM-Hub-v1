import { Pool } from 'pg';
import config from '../config';
import logger from '../utils/logger';
import {
  Conversation,
  ConversationMessage,
  CreateConversationRequest,
  SendMessageRequest,
  ConversationListRequest,
  ConversationResponse,
} from '../models';
import { v4 as uuidv4 } from 'uuid';

export class ConversationService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Initialize conversations table
   */
  async initializeTables(): Promise<void> {
    try {
      // Create conversations table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS rag_conversations (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL,
          title VARCHAR(500) NOT NULL,
          language VARCHAR(5) NOT NULL DEFAULT 'ar',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          last_message_at TIMESTAMP,
          message_count INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true
        )
      `);

      // Create conversation_messages table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS rag_conversation_messages (
          id UUID PRIMARY KEY,
          conversation_id UUID NOT NULL REFERENCES rag_conversations(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL,
          content TEXT NOT NULL,
          sources JSONB,
          metadata JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      // Create indexes
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_conversations_user_id
        ON rag_conversations(user_id)
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_conversations_user_active
        ON rag_conversations(user_id, is_active, last_message_at DESC)
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
        ON rag_conversation_messages(conversation_id, created_at)
      `);

      logger.info('Conversation tables initialized successfully');
    } catch (error) {
      logger.error('Error initializing conversation tables:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    request: CreateConversationRequest
  ): Promise<Conversation> {
    try {
      const id = uuidv4();
      const title = request.title || 'محادثة جديدة';
      const language = request.language || 'ar';

      const result = await this.pool.query(
        `INSERT INTO rag_conversations
         (id, user_id, title, language, created_at, updated_at, message_count, is_active)
         VALUES ($1, $2, $3, $4, NOW(), NOW(), 0, true)
         RETURNING *`,
        [id, request.userId, title, language]
      );

      const row = result.rows[0];
      const conversation: Conversation = {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        language: row.language,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastMessageAt: row.last_message_at,
        messageCount: row.message_count,
        isActive: row.is_active,
      };

      logger.info(`Created conversation ${id} for user ${request.userId}`);
      return conversation;
    } catch (error) {
      logger.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(
    conversationId: string,
    userId: string
  ): Promise<Conversation | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM rag_conversations
         WHERE id = $1 AND user_id = $2`,
        [conversationId, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        language: row.language,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastMessageAt: row.last_message_at,
        messageCount: row.message_count,
        isActive: row.is_active,
      };
    } catch (error) {
      logger.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation with messages
   */
  async getConversationWithMessages(
    conversationId: string,
    userId: string
  ): Promise<ConversationResponse | null> {
    try {
      const conversation = await this.getConversation(conversationId, userId);
      if (!conversation) {
        return null;
      }

      const messages = await this.getMessages(conversationId);

      return {
        conversation,
        messages,
      };
    } catch (error) {
      logger.error('Error getting conversation with messages:', error);
      throw error;
    }
  }

  /**
   * List user conversations
   */
  async listConversations(
    request: ConversationListRequest
  ): Promise<Conversation[]> {
    try {
      const limit = request.limit || 50;
      const offset = request.offset || 0;

      const result = await this.pool.query(
        `SELECT * FROM rag_conversations
         WHERE user_id = $1 AND is_active = true
         ORDER BY last_message_at DESC NULLS LAST, created_at DESC
         LIMIT $2 OFFSET $3`,
        [request.userId, limit, offset]
      );

      return result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        language: row.language,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastMessageAt: row.last_message_at,
        messageCount: row.message_count,
        isActive: row.is_active,
      }));
    } catch (error) {
      logger.error('Error listing conversations:', error);
      throw error;
    }
  }

  /**
   * Add message to conversation
   */
  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    sources?: any[],
    metadata?: any
  ): Promise<ConversationMessage> {
    try {
      const id = uuidv4();

      const result = await this.pool.query(
        `INSERT INTO rag_conversation_messages
         (id, conversation_id, role, content, sources, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [id, conversationId, role, content, JSON.stringify(sources), JSON.stringify(metadata)]
      );

      // Update conversation
      await this.pool.query(
        `UPDATE rag_conversations
         SET message_count = message_count + 1,
             last_message_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [conversationId]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role,
        content: row.content,
        sources: row.sources,
        metadata: row.metadata,
        createdAt: row.created_at,
      };
    } catch (error) {
      logger.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId: string): Promise<ConversationMessage[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM rag_conversation_messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC`,
        [conversationId]
      );

      return result.rows.map((row) => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role,
        content: row.content,
        sources: row.sources,
        metadata: row.metadata,
        createdAt: row.created_at,
      }));
    } catch (error) {
      logger.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Get conversation context (last N messages)
   */
  async getConversationContext(
    conversationId: string,
    limit: number = 10
  ): Promise<ConversationMessage[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM rag_conversation_messages
         WHERE conversation_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [conversationId, limit]
      );

      return result.rows.reverse().map((row) => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role,
        content: row.content,
        sources: row.sources,
        metadata: row.metadata,
        createdAt: row.created_at,
      }));
    } catch (error) {
      logger.error('Error getting conversation context:', error);
      throw error;
    }
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(
    conversationId: string,
    userId: string,
    title: string
  ): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE rag_conversations
         SET title = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3`,
        [title, conversationId, userId]
      );

      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error updating conversation title:', error);
      throw error;
    }
  }

  /**
   * Delete conversation (soft delete)
   */
  async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE rag_conversations
         SET is_active = false, updated_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [conversationId, userId]
      );

      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Get user conversation count
   */
  async getUserConversationCount(userId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COUNT(*) as count FROM rag_conversations
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      );

      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('Error getting conversation count:', error);
      return 0;
    }
  }
}

// Export singleton instance
import databaseService from './database.service';
export default new ConversationService(databaseService['pool']);
