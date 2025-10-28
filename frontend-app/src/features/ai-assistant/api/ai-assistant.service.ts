import axiosClient from '@/lib/axios-client';
import type {
  ApiResponse,
  QueryRequest,
  QueryResponse,
  CreateConversationRequest,
  Conversation,
  SendMessageRequest,
  Message,
  ConversationResponse,
  VoiceMessageResponse,
  TranscriptionResponse,
  CorrespondenceStatistics,
  WorkflowStatistics,
  CorrespondenceTimeSeries,
  WorkflowTracking,
  PerformanceReport,
  UserProductivity,
  SearchResult,
  StatsFilters,
} from '../types';

// Base URL for RAG system
const RAG_BASE_URL = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:3001/api/rag';

// Create axios instance for RAG system
const ragClient = axiosClient.create({
  baseURL: RAG_BASE_URL,
  timeout: 120000, // 2 minutes for long-running AI operations
});

/**
 * AI Assistant Service
 * Provides methods to interact with BDFM RAG System
 */
export class AIAssistantService {
  // ==========================================
  // RAG Query Endpoints
  // ==========================================

  /**
   * Query the RAG system with a question
   */
  static async query(request: QueryRequest): Promise<QueryResponse> {
    const response = await ragClient.post<ApiResponse<QueryResponse>>('/query', request);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في الاستعلام');
    }
    return response.data.data;
  }

  /**
   * Query with streaming response
   * Returns a ReadableStream for progressive responses
   */
  static async queryStream(request: QueryRequest): Promise<ReadableStream> {
    const response = await fetch(`${RAG_BASE_URL}/query/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok || !response.body) {
      throw new Error('فشل في بدء البث');
    }

    return response.body;
  }

  /**
   * Search without LLM generation
   */
  static async search(request: QueryRequest): Promise<SearchResult[]> {
    const response = await ragClient.post<ApiResponse<SearchResult[]>>('/search', request);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في البحث');
    }
    return response.data.data;
  }

  // ==========================================
  // Conversation Endpoints
  // ==========================================

  /**
   * Create a new conversation
   */
  static async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    const response = await ragClient.post<ApiResponse<Conversation>>('/conversations', request);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في إنشاء المحادثة');
    }
    return response.data.data;
  }

  /**
   * Get all conversations for a user
   */
  static async listConversations(userId: string, limit = 50, offset = 0): Promise<Conversation[]> {
    const response = await ragClient.get<ApiResponse<Conversation[]>>('/conversations', {
      params: { userId, limit, offset },
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب المحادثات');
    }
    return response.data.data;
  }

  /**
   * Get a specific conversation with all messages
   */
  static async getConversation(conversationId: string, userId: string): Promise<ConversationResponse> {
    const response = await ragClient.get<ApiResponse<ConversationResponse>>(`/conversations/${conversationId}`, {
      params: { userId },
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب المحادثة');
    }
    return response.data.data;
  }

  /**
   * Send a message in a conversation
   */
  static async sendMessage(request: SendMessageRequest): Promise<Message> {
    const response = await ragClient.post<ApiResponse<Message>>('/conversations/message', request);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في إرسال الرسالة');
    }
    return response.data.data;
  }

  /**
   * Send message with streaming response
   */
  static async sendMessageStream(request: SendMessageRequest): Promise<ReadableStream> {
    const response = await fetch(`${RAG_BASE_URL}/conversations/message/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok || !response.body) {
      throw new Error('فشل في بدء البث');
    }

    return response.body;
  }

  /**
   * Update conversation title
   */
  static async updateConversationTitle(conversationId: string, userId: string, title: string): Promise<Conversation> {
    const response = await ragClient.put<ApiResponse<Conversation>>(`/conversations/${conversationId}/title`, {
      userId,
      title,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في تحديث العنوان');
    }
    return response.data.data;
  }

  /**
   * Delete a conversation
   */
  static async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const response = await ragClient.delete<ApiResponse<void>>(`/conversations/${conversationId}`, {
      params: { userId },
    });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'فشل في حذف المحادثة');
    }
  }

  // ==========================================
  // Speech-to-Text Endpoints
  // ==========================================

  /**
   * Transcribe audio file to text
   */
  static async transcribeAudio(audioFile: File, language: 'ar' | 'en' | 'auto' = 'auto'): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);

    const response = await ragClient.post<ApiResponse<TranscriptionResponse>>('/speech/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في تحويل الصوت');
    }
    return response.data.data;
  }

  /**
   * Transcribe audio from URL
   */
  static async transcribeAudioFromUrl(url: string, language: 'ar' | 'en' | 'auto' = 'auto'): Promise<TranscriptionResponse> {
    const response = await ragClient.post<ApiResponse<TranscriptionResponse>>('/speech/transcribe-url', {
      url,
      language,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في تحويل الصوت');
    }
    return response.data.data;
  }

  /**
   * Send voice message in conversation (transcribe + query)
   */
  static async sendVoiceMessage(
    audioFile: File,
    conversationId: string,
    userId: string,
    options?: {
      language?: 'ar' | 'en' | 'auto';
      maxResults?: number;
      similarityThreshold?: number;
    }
  ): Promise<VoiceMessageResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('conversationId', conversationId);
    formData.append('userId', userId);
    if (options?.language) formData.append('language', options.language);
    if (options?.maxResults) formData.append('maxResults', options.maxResults.toString());
    if (options?.similarityThreshold) formData.append('similarityThreshold', options.similarityThreshold.toString());

    const response = await ragClient.post<ApiResponse<VoiceMessageResponse>>('/speech/voice-message', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في إرسال الرسالة الصوتية');
    }
    return response.data.data;
  }

  /**
   * Send voice message with streaming
   */
  static async sendVoiceMessageStream(
    audioFile: File,
    conversationId: string,
    userId: string,
    options?: {
      language?: 'ar' | 'en' | 'auto';
      maxResults?: number;
      similarityThreshold?: number;
    }
  ): Promise<ReadableStream> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('conversationId', conversationId);
    formData.append('userId', userId);
    if (options?.language) formData.append('language', options.language);
    if (options?.maxResults) formData.append('maxResults', options.maxResults.toString());
    if (options?.similarityThreshold) formData.append('similarityThreshold', options.similarityThreshold.toString());

    const response = await fetch(`${RAG_BASE_URL}/speech/voice-message/stream`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok || !response.body) {
      throw new Error('فشل في بدء البث');
    }

    return response.body;
  }

  /**
   * Get supported audio formats
   */
  static async getSupportedFormats(): Promise<{
    formats: string[];
    maxFileSize: number;
    maxFileSizeMB: number;
    maxDuration: number;
    maxDurationMinutes: number;
  }> {
    const response = await ragClient.get<ApiResponse<any>>('/speech/formats');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب الصيغ المدعومة');
    }
    return response.data.data;
  }

  /**
   * Detect language from audio
   */
  static async detectLanguage(audioFile: File): Promise<{ language: string; filename: string }> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await ragClient.post<ApiResponse<any>>('/speech/detect-language', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في كشف اللغة');
    }
    return response.data.data;
  }

  // ==========================================
  // Statistics Endpoints
  // ==========================================

  /**
   * Get correspondence statistics overview
   */
  static async getCorrespondenceStats(filters?: StatsFilters): Promise<CorrespondenceStatistics> {
    const params = filters ? {
      dateFrom: filters.dateFrom?.toISOString(),
      dateTo: filters.dateTo?.toISOString(),
      correspondenceType: filters.correspondenceType?.join(','),
      priorityLevel: filters.priorityLevel?.join(','),
      secrecyLevel: filters.secrecyLevel?.join(','),
      userId: filters.userId,
    } : {};

    const response = await ragClient.get<ApiResponse<CorrespondenceStatistics>>('/statistics/correspondences/overview', {
      params,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب الإحصائيات');
    }
    return response.data.data;
  }

  /**
   * Get correspondence time series data
   */
  static async getCorrespondenceTimeSeries(
    period: 'day' | 'week' | 'month' | 'year',
    filters?: StatsFilters
  ): Promise<CorrespondenceTimeSeries> {
    const params = {
      period,
      ...(filters ? {
        dateFrom: filters.dateFrom?.toISOString(),
        dateTo: filters.dateTo?.toISOString(),
        correspondenceType: filters.correspondenceType?.join(','),
        priorityLevel: filters.priorityLevel?.join(','),
        userId: filters.userId,
      } : {}),
    };

    const response = await ragClient.get<ApiResponse<CorrespondenceTimeSeries>>('/statistics/correspondences/time-series', {
      params,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب البيانات الزمنية');
    }
    return response.data.data;
  }

  /**
   * Get workflow statistics overview
   */
  static async getWorkflowStats(filters?: StatsFilters): Promise<WorkflowStatistics> {
    const params = filters ? {
      dateFrom: filters.dateFrom?.toISOString(),
      dateTo: filters.dateTo?.toISOString(),
      status: filters.status?.join(','),
      userId: filters.userId,
    } : {};

    const response = await ragClient.get<ApiResponse<WorkflowStatistics>>('/statistics/workflow/overview', {
      params,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب إحصائيات سير العمل');
    }
    return response.data.data;
  }

  /**
   * Get workflow tracking for a correspondence
   */
  static async getWorkflowTracking(correspondenceId: string): Promise<WorkflowTracking> {
    const response = await ragClient.get<ApiResponse<WorkflowTracking>>(
      `/statistics/workflow/tracking/${correspondenceId}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب تتبع سير العمل');
    }
    return response.data.data;
  }

  /**
   * Get overdue workflow steps
   */
  static async getOverdueWorkflowSteps(userId?: string): Promise<any[]> {
    const response = await ragClient.get<ApiResponse<any[]>>('/statistics/workflow/overdue', {
      params: userId ? { userId } : {},
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب الخطوات المتأخرة');
    }
    return response.data.data;
  }

  /**
   * Get performance report
   */
  static async getPerformanceReport(startDate: Date, endDate: Date, userId?: string): Promise<PerformanceReport> {
    const response = await ragClient.get<ApiResponse<PerformanceReport>>('/statistics/reports/performance', {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...(userId ? { userId } : {}),
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب تقرير الأداء');
    }
    return response.data.data;
  }

  /**
   * Get user productivity statistics
   */
  static async getUserProductivity(userId: string, startDate: Date, endDate: Date): Promise<UserProductivity> {
    const response = await ragClient.get<ApiResponse<UserProductivity>>(
      `/statistics/users/${userId}/productivity`,
      {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'فشل في جلب إحصائيات الإنتاجية');
    }
    return response.data.data;
  }

  /**
   * Clear statistics cache
   */
  static async clearStatisticsCache(): Promise<void> {
    const response = await ragClient.post<ApiResponse<void>>('/statistics/cache/clear');
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'فشل في مسح الذاكرة المؤقتة');
    }
  }

  // ==========================================
  // System Health
  // ==========================================

  /**
   * Check system health
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await ragClient.get<ApiResponse<any>>('/health');
    if (!response.data.success || !response.data.data) {
      throw new Error('النظام غير متاح');
    }
    return response.data.data;
  }

  /**
   * Get system status
   */
  static async getStatus(): Promise<{
    qdrant: { connected: boolean; collections: Record<string, number> };
    ollama: { connected: boolean; models: string[] };
    postgres: { connected: boolean };
  }> {
    const response = await ragClient.get<ApiResponse<any>>('/status');
    if (!response.data.success || !response.data.data) {
      throw new Error('فشل في جلب حالة النظام');
    }
    return response.data.data;
  }
}

export default AIAssistantService;
