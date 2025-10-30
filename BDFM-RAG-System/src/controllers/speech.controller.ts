import { Request, Response } from 'express';
import speechToTextService from '../services/speech-to-text.service';
import conversationRAGService from '../services/conversation-rag.service';
import conversationService from '../services/conversation.service';
import logger from '../utils/logger';
import { VoiceMessageRequest } from '../models';

/**
 * Speech Controller
 * Handles speech-to-text operations and voice messages
 */
export class SpeechController {
  /**
   * Transcribe audio file
   * POST /speech/transcribe
   */
  async transcribe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            message: 'No audio file provided',
            code: 'NO_FILE',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { language = 'auto', responseFormat = 'json' } = req.body;

      logger.info(
        `Transcribing audio file: ${req.file.originalname}, size: ${req.file.size}`
      );

      const result = await speechToTextService.transcribeAudio(
        req.file.buffer,
        req.file.originalname,
        {
          language: language === 'auto' ? 'auto' : language,
          responseFormat,
        }
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in transcribe:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to transcribe audio',
          code: 'TRANSCRIPTION_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Transcribe audio from URL
   * POST /speech/transcribe-url
   */
  async transcribeFromUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url, language = 'auto', responseFormat = 'json' } = req.body;

      if (!url) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Audio URL is required',
            code: 'MISSING_URL',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Transcribing audio from URL: ${url}`);

      const result = await speechToTextService.transcribeFromUrl(url, {
        language: language === 'auto' ? 'auto' : language,
        responseFormat,
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in transcribeFromUrl:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to transcribe audio from URL',
          code: 'TRANSCRIPTION_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send voice message in conversation (transcribe + query)
   * POST /speech/voice-message
   */
  async sendVoiceMessage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            message: 'No audio file provided',
            code: 'NO_FILE',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const {
        conversationId,
        userId,
        language = 'auto',
        maxResults,
        similarityThreshold,
        filters,
      } = req.body;

      if (!conversationId || !userId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'conversationId and userId are required',
            code: 'MISSING_REQUIRED_FIELDS',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(
        `Processing voice message for conversation ${conversationId}, user ${userId}`
      );

      // Step 1: Verify conversation belongs to user
      const conversation = await conversationService.getConversation(
        conversationId,
        userId
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Conversation not found or access denied',
            code: 'CONVERSATION_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Step 2: Transcribe audio
      logger.info(`Transcribing audio file: ${req.file.originalname}`);
      const transcription = await speechToTextService.transcribeAudio(
        req.file.buffer,
        req.file.originalname,
        {
          language: language === 'auto' ? 'auto' : language,
        }
      );

      if (!transcription.text || transcription.text.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Could not transcribe audio or audio is empty',
            code: 'EMPTY_TRANSCRIPTION',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(
        `Transcription successful: ${transcription.text.substring(0, 100)}...`
      );

      // Step 3: Send message to conversation with RAG
      const messageRequest: any = {
        conversationId,
        userId,
        message: transcription.text,
        maxResults,
        similarityThreshold,
        filters,
      };

      const assistantMessage =
        await conversationRAGService.sendMessage(messageRequest);

      res.json({
        success: true,
        data: {
          transcription: {
            text: transcription.text,
            language: transcription.language,
            metadata: transcription.metadata,
          },
          message: assistantMessage,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in sendVoiceMessage:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to process voice message',
          code: 'VOICE_MESSAGE_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send voice message with streaming response
   * POST /speech/voice-message/stream
   */
  async sendVoiceMessageStream(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            message: 'No audio file provided',
            code: 'NO_FILE',
          },
        });
        return;
      }

      const {
        conversationId,
        userId,
        language = 'auto',
        maxResults,
        similarityThreshold,
        filters,
      } = req.body;

      if (!conversationId || !userId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'conversationId and userId are required',
            code: 'MISSING_REQUIRED_FIELDS',
          },
        });
        return;
      }

      // Verify conversation
      const conversation = await conversationService.getConversation(
        conversationId,
        userId
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Conversation not found or access denied',
            code: 'CONVERSATION_NOT_FOUND',
          },
        });
        return;
      }

      // Transcribe audio
      const transcription = await speechToTextService.transcribeAudio(
        req.file.buffer,
        req.file.originalname,
        {
          language: language === 'auto' ? 'auto' : language,
        }
      );

      if (!transcription.text || transcription.text.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Could not transcribe audio or audio is empty',
            code: 'EMPTY_TRANSCRIPTION',
          },
        });
        return;
      }

      // Setup SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send transcription first
      res.write(
        `data: ${JSON.stringify({
          type: 'transcription',
          text: transcription.text,
          language: transcription.language,
        })}\n\n`
      );

      // Stream RAG response
      const messageRequest: any = {
        conversationId,
        userId,
        message: transcription.text,
        maxResults,
        similarityThreshold,
        filters,
      };

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream the response
      for await (const chunk of conversationRAGService.sendMessageStream(
        messageRequest
      )) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      res.end();
    } catch (error: any) {
      logger.error('Error in sendVoiceMessageStream:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            message: error.message || 'Failed to process voice message stream',
            code: 'VOICE_MESSAGE_STREAM_ERROR',
          },
        });
      }
    }
  }

  /**
   * Get supported audio formats
   * GET /speech/formats
   */
  async getSupportedFormats(req: Request, res: Response): Promise<void> {
    try {
      const formats = speechToTextService.getSupportedFormats();
      const maxFileSize = speechToTextService.getMaxFileSize();
      const maxDuration = speechToTextService.getMaxDuration();

      res.json({
        success: true,
        data: {
          formats,
          maxFileSize,
          maxFileSizeMB: Math.round(maxFileSize / 1024 / 1024),
          maxDuration,
          maxDurationMinutes: Math.round(maxDuration / 60),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in getSupportedFormats:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get supported formats',
          code: 'ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Detect language from audio
   * POST /speech/detect-language
   */
  async detectLanguage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            message: 'No audio file provided',
            code: 'NO_FILE',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const language = await speechToTextService.detectLanguage(
        req.file.buffer,
        req.file.originalname
      );

      res.json({
        success: true,
        data: {
          language,
          filename: req.file.originalname,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in detectLanguage:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to detect language',
          code: 'LANGUAGE_DETECTION_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new SpeechController();
