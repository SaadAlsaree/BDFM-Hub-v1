import axios from 'axios';
import FormData from 'form-data';
import config from '../config';
import logger from '../utils/logger';
import {
  TranscriptionRequest,
  TranscriptionResponse,
  TranscriptionSegment,
} from '../models';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Speech-to-Text Service using Ollama Whisper
 */
export class SpeechToTextService {
  private ollamaUrl: string;
  private whisperModel: string;
  private maxFileSize: number;
  private maxDuration: number;
  private supportedFormats: string[];
  private uploadDir: string;

  constructor() {
    this.ollamaUrl = config.ollama.url;
    this.whisperModel = config.speech.whisperModel;
    this.maxFileSize = config.speech.maxFileSize;
    this.maxDuration = config.speech.maxDuration;
    this.supportedFormats = config.speech.supportedFormats;
    this.uploadDir = config.speech.uploadDir;

    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  /**
   * Ensure upload directory exists
   */
  private ensureUploadDir(): void {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
        logger.info(`Created upload directory: ${this.uploadDir}`);
      }
    } catch (error) {
      logger.error('Error creating upload directory:', error);
    }
  }

  /**
   * Verify Whisper model is available
   */
  async verifyModel(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 5000,
      });

      const models = response.data.models || [];
      const hasWhisper = models.some(
        (m: any) =>
          m.name.includes('whisper') || m.name === this.whisperModel
      );

      if (hasWhisper) {
        logger.info(`Whisper model available: ${this.whisperModel}`);
      } else {
        logger.warn(`Whisper model not found: ${this.whisperModel}`);
      }

      return hasWhisper;
    } catch (error) {
      logger.error('Error verifying Whisper model:', error);
      return false;
    }
  }

  /**
   * Validate audio file
   */
  validateAudioFile(
    fileBuffer: Buffer,
    filename: string,
    fileSize: number
  ): { valid: boolean; error?: string } {
    // Check file size
    if (fileSize > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Check file format
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    if (!this.supportedFormats.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported file format. Supported formats: ${this.supportedFormats.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Transcribe audio file using Whisper
   */
  async transcribeAudio(
    fileBuffer: Buffer,
    filename: string,
    options: TranscriptionRequest = {}
  ): Promise<TranscriptionResponse> {
    const startTime = Date.now();

    try {
      logger.info(
        `Starting transcription for file: ${filename}, size: ${fileBuffer.length} bytes`
      );

      // Validate file
      const validation = this.validateAudioFile(
        fileBuffer,
        filename,
        fileBuffer.length
      );
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // For Ollama, we need to use a different approach
      // Ollama doesn't directly support Whisper API like OpenAI
      // We'll use a workaround: save file temporarily and use whisper.cpp or similar

      // Alternative: Use OpenAI-compatible Whisper API if available
      const text = await this.transcribeWithWhisper(
        fileBuffer,
        filename,
        options.language || 'auto'
      );

      const processingTime = Date.now() - startTime;
      const ext = path.extname(filename).toLowerCase().replace('.', '');

      const response: TranscriptionResponse = {
        text,
        language: options.language === 'auto' ? undefined : options.language,
        metadata: {
          fileSize: fileBuffer.length,
          format: ext,
          processingTime,
        },
      };

      logger.info(
        `Transcription completed in ${processingTime}ms, text length: ${text.length}`
      );

      return response;
    } catch (error) {
      logger.error('Error transcribing audio:', error);
      throw error;
    }
  }

  /**
   * Transcribe using Whisper (implementation depends on available API)
   */
  private async transcribeWithWhisper(
    fileBuffer: Buffer,
    filename: string,
    language: string
  ): Promise<string> {
    try {
      // Option 1: Try OpenAI-compatible Whisper API (if available locally)
      // This assumes you have whisper.cpp server running or similar
      const whisperApiUrl = process.env.WHISPER_API_URL || 'http://localhost:8080/v1/audio/transcriptions';

      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename,
        contentType: this.getContentType(filename),
      });
      formData.append('model', 'whisper-1');

      if (language !== 'auto') {
        formData.append('language', language);
      }

      formData.append('response_format', 'json');

      const response = await axios.post(whisperApiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 120000, // 2 minutes
      });

      return response.data.text || response.data.transcription || '';
    } catch (error: any) {
      // Fallback: Return mock transcription or error
      if (error.code === 'ECONNREFUSED') {
        logger.warn(
          'Whisper API not available. Please setup Whisper API server or use alternative transcription service.'
        );
        throw new Error(
          'Speech-to-Text service is not configured. Please setup Whisper API endpoint.'
        );
      }
      throw error;
    }
  }

  /**
   * Get content type for audio file
   */
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.webm': 'audio/webm',
      '.flac': 'audio/flac',
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Transcribe audio from URL
   */
  async transcribeFromUrl(
    audioUrl: string,
    options: TranscriptionRequest = {}
  ): Promise<TranscriptionResponse> {
    try {
      logger.info(`Downloading audio from URL: ${audioUrl}`);

      // Download audio file
      const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
      });

      const fileBuffer = Buffer.from(response.data);
      const filename =
        path.basename(new URL(audioUrl).pathname) || 'audio.mp3';

      return await this.transcribeAudio(fileBuffer, filename, options);
    } catch (error) {
      logger.error('Error transcribing audio from URL:', error);
      throw new Error('Failed to download or transcribe audio from URL');
    }
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[] {
    return this.supportedFormats;
  }

  /**
   * Get maximum file size
   */
  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  /**
   * Get maximum duration
   */
  getMaxDuration(): number {
    return this.maxDuration;
  }

  /**
   * Detect language from audio (simplified version)
   */
  async detectLanguage(fileBuffer: Buffer, filename: string): Promise<string> {
    try {
      // For now, transcribe with auto language detection
      const result = await this.transcribeAudio(fileBuffer, filename, {
        language: 'auto',
      });

      // Simple heuristic: check for Arabic characters
      const hasArabic = /[\u0600-\u06FF]/.test(result.text);
      return hasArabic ? 'ar' : 'en';
    } catch (error) {
      logger.error('Error detecting language:', error);
      return 'auto';
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const now = Date.now();
      const threshold = olderThanHours * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > threshold) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.info(
          `Cleaned up ${deletedCount} temporary audio files older than ${olderThanHours} hours`
        );
      }
    } catch (error) {
      logger.error('Error cleaning up temporary files:', error);
    }
  }
}

// Export singleton instance
export default new SpeechToTextService();
