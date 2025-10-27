import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // PostgreSQL
  postgres: {
    host: process.env.POSTGRES_HOST || 'cm-db.inss.local',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'cmdb',
    user: process.env.POSTGRES_USER || 'cmuser',
    password: process.env.POSTGRES_PASSWORD || '@DYKMk7xjB25',
    max: 20, // connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // Qdrant
  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY || undefined,
  },

  // Ollama
  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'qwen2.5:3b',
    chatModel: process.env.OLLAMA_CHAT_MODEL || 'gpt-oss:20b',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '120000', 10),
  },

  // RAG
  rag: {
    embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION || '3584', 10),
    chunkSize: parseInt(process.env.CHUNK_SIZE || '500', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '50', 10),
    maxResults: parseInt(process.env.MAX_RESULTS || '10', 10),
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.7'),
  },

  // Collections
  collections: {
    correspondence: process.env.CORRESPONDENCE_COLLECTION || 'bdfm_correspondences',
    workflow: process.env.WORKFLOW_COLLECTION || 'bdfm_workflows',
    userGuide: process.env.USER_GUIDE_COLLECTION || 'bdfm_user_guide',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/bdfm-rag.log',
  },

  // Speech-to-Text
  speech: {
    whisperModel: process.env.WHISPER_MODEL || 'whisper:latest',
    maxFileSize: parseInt(process.env.MAX_AUDIO_FILE_SIZE || '26214400', 10), // 25MB
    maxDuration: parseInt(process.env.MAX_AUDIO_DURATION || '600', 10), // 10 minutes
    supportedFormats: ['mp3', 'wav', 'ogg', 'm4a', 'webm', 'flac'],
    uploadDir: process.env.UPLOAD_DIR || 'uploads/audio',
  },

  // Statistics
  statistics: {
    cacheEnabled: process.env.STATS_CACHE_ENABLED === 'true',
    cacheTTL: parseInt(process.env.STATS_CACHE_TTL || '300', 10), // 5 minutes
    defaultLimit: parseInt(process.env.STATS_DEFAULT_LIMIT || '100', 10),
  },
} as const;

export default config;
