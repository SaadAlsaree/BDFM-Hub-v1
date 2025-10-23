import express, { Application } from 'express';
import cors from 'cors';
import config from './config';
import logger from './utils/logger';
import routes from './routes';
import conversationRoutes from './routes/conversation.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import qdrantService from './services/qdrant.service';
import databaseService from './services/database.service';
import embeddingService from './services/embedding.service';
import llmService from './services/llm.service';
import conversationService from './services/conversation.service';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // CORS
    this.app.use(
      cors({
        origin: '*', // Configure based on your needs
        credentials: true,
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // API routes
    this.app.use('/api/rag', routes);
    this.app.use('/api/rag', conversationRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'BDFM RAG System',
          version: '1.1.0',
          description:
            'RAG system for BDFM.Hub with conversation support',
          endpoints: {
            // RAG Endpoints
            query: 'POST /api/rag/query',
            queryStream: 'POST /api/rag/query/stream',
            search: 'POST /api/rag/search',
            sync: 'POST /api/rag/sync',
            index: 'POST /api/rag/index',
            delete: 'DELETE /api/rag/correspondence/:id',
            rebuild: 'POST /api/rag/rebuild',
            status: 'GET /api/rag/status',
            syncStats: 'GET /api/rag/sync/stats',
            health: 'GET /api/rag/health',
            // Conversation Endpoints
            createConversation: 'POST /api/rag/conversations',
            listConversations: 'GET /api/rag/conversations',
            getConversation: 'GET /api/rag/conversations/:id',
            updateTitle: 'PUT /api/rag/conversations/:id/title',
            deleteConversation: 'DELETE /api/rag/conversations/:id',
            sendMessage: 'POST /api/rag/conversations/message',
            sendMessageStream: 'POST /api/rag/conversations/message/stream',
          },
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * Initialize services
   */
  private async initializeServices(): Promise<void> {
    logger.info('Initializing services...');

    try {
      // Test database connection
      const dbConnected = await databaseService.testConnection();
      if (!dbConnected) {
        logger.warn('Database connection failed, but continuing...');
      } else {
        // Initialize conversation tables
        await conversationService.initializeTables();
      }

      // Initialize Qdrant
      await qdrantService.initialize();

      // Verify Ollama models
      const embeddingModelAvailable = await embeddingService.verifyModel();
      if (!embeddingModelAvailable) {
        logger.warn(
          `Embedding model ${config.ollama.embeddingModel} not available`
        );
      }

      const chatModelAvailable = await llmService.verifyModel();
      if (!chatModelAvailable) {
        logger.warn(`Chat model ${config.ollama.chatModel} not available`);
      }

      logger.info('Services initialized successfully');
    } catch (error) {
      logger.error('Error initializing services:', error);
      throw error;
    }
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Initialize services
      await this.initializeServices();

      // Start server
      this.app.listen(config.server.port, () => {
        logger.info(
          `BDFM RAG System started on port ${config.server.port} in ${config.server.nodeEnv} mode`
        );
        logger.info(`API: http://localhost:${config.server.port}/api/rag`);
        logger.info(`Docs: http://localhost:${config.server.port}/`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down gracefully...');

    try {
      await databaseService.close();
      logger.info('Shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start app
const app = new App();

// Handle graceful shutdown
process.on('SIGINT', () => app.shutdown());
process.on('SIGTERM', () => app.shutdown());

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  app.shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  app.shutdown();
});

// Start the server
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default app;
