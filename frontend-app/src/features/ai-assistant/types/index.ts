// AI Assistant Types for BDFM RAG System Integration

export interface Message {
  id: string;
  conversationId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SearchResult[];
  metadata?: MessageMetadata;
  createdAt: Date;
  isVoice?: boolean;
  isStreaming?: boolean;
}

export interface SearchResult {
  id: string;
  mailNum: string;
  mailDate: string;
  subject: string;
  bodyText: string;
  correspondenceType: string;
  secrecyLevel: string;
  priorityLevel: string;
  personalityLevel?: string;
  similarityScore: number;
  highlights?: string[];
}

export interface MessageMetadata {
  queryProcessingTime?: number;
  embeddingTime?: number;
  searchTime?: number;
  generationTime?: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  language: 'ar' | 'en';
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  messageCount: number;
  isActive: boolean;
}

export interface ConversationListItem extends Conversation {
  preview?: string;
  unreadCount?: number;
}

// Query & Search
export interface QueryRequest {
  query: string;
  language?: 'ar' | 'en';
  maxResults?: number;
  similarityThreshold?: number;
  filters?: SearchFilters;
}

export interface SearchFilters {
  correspondenceType?: string[];
  priorityLevel?: string[];
  secrecyLevel?: string[];
  dateFrom?: string;
  dateTo?: string;
  organizationalUnitId?: string;
}

export interface QueryResponse {
  answer: string;
  sources: SearchResult[];
  language: string;
  metadata?: MessageMetadata;
}

// Conversations
export interface CreateConversationRequest {
  userId: string;
  title?: string;
  language?: 'ar' | 'en';
}

export interface SendMessageRequest {
  conversationId: string;
  userId: string;
  message: string;
  maxResults?: number;
  similarityThreshold?: number;
  filters?: SearchFilters;
}

export interface ConversationResponse {
  conversation: Conversation;
  messages: Message[];
}

// Speech-to-Text
export interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  metadata?: {
    fileSize: number;
    format: string;
    processingTime: number;
  };
}

export interface VoiceMessageRequest {
  conversationId: string;
  userId: string;
  language?: 'ar' | 'en' | 'auto';
  maxResults?: number;
  similarityThreshold?: number;
  filters?: SearchFilters;
}

export interface VoiceMessageResponse {
  transcription: TranscriptionResponse;
  message: Message;
}

// Statistics
export interface CorrespondenceStatistics {
  total: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  bySecrecy: Record<string, number>;
  byStatus: Record<string, number>;
  withAttachments: number;
  drafts: number;
}

export interface WorkflowStatistics {
  total: number;
  byStatus: Record<string, number>;
  byAction: Record<string, number>;
  overdue: number;
  timeSensitive: number;
  avgCompletionTime?: number;
  completionRate: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
  label?: string;
}

export interface CorrespondenceTimeSeries {
  period: 'day' | 'week' | 'month' | 'year';
  data: TimeSeriesData[];
  total: number;
  average: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface WorkflowTrackingStep {
  id: string;
  actionType: string;
  status: string;
  fromUserId?: string;
  toPrimaryRecipientId: string;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  isOverdue: boolean;
  duration?: number;
}

export interface WorkflowTracking {
  correspondenceId: string;
  correspondence: {
    mailNum: string;
    mailDate: string;
    subject: string;
    correspondenceType: string;
    priorityLevel: string;
  };
  steps: WorkflowTrackingStep[];
  currentStatus: string;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  avgStepDuration?: number;
  totalDuration?: number;
}

export interface PerformanceReport {
  period: {
    from: string;
    to: string;
  };
  correspondences: {
    total: number;
    created: number;
    completed: number;
    pending: number;
    avgProcessingTime?: number;
  };
  workflows: {
    totalSteps: number;
    completedSteps: number;
    pendingSteps: number;
    overdueSteps: number;
    completionRate: number;
    avgCompletionTime?: number;
  };
}

export interface UserProductivity {
  userId: string;
  period: {
    from: string;
    to: string;
  };
  correspondencesCreated: number;
  correspondencesSigned: number;
  workflowStepsCompleted: number;
  workflowStepsPending: number;
  avgResponseTime?: number;
  completionRate: number;
  overdueCount: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

// UI State
export interface ChatState {
  conversations: ConversationListItem[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}

export interface VoiceState {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string | null;
  error: string | null;
}

export interface StatsFilters {
  dateFrom?: Date;
  dateTo?: Date;
  correspondenceType?: string[];
  priorityLevel?: string[];
  secrecyLevel?: string[];
  status?: string[];
  userId?: string;
}
