// ============================================
// Correspondence Models
// ============================================

export interface Correspondence {
  id: string;
  mailNum: string;
  mailDate: string;
  subject: string;
  bodyText: string;
  correspondenceType: string;
  secrecyLevel: string;
  priorityLevel: string;
  personalityLevel: string;
  externalReferenceNumber?: string;
  externalReferenceDate?: string;
  isDraft: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  createByUserId?: string;
  signatoryUserId?: string;
  externalEntityId?: string;
  fileId?: string;
  createdAt: Date;
  lastUpdatedAt?: Date;
  isDeleted: boolean;
}

// ============================================
// Workflow Models
// ============================================

export interface WorkflowStep {
  id: string;
  correspondenceId: string;
  fromUserId?: string;
  fromUnitId?: string;
  actionType: string;
  instructionText?: string;
  toPrimaryRecipientType: string;
  toPrimaryRecipientId: string;
  dueDate?: Date;
  status: string;
  isTimeSensitive: boolean;
  createdAt: Date;
  isDeleted: boolean;
}

// ============================================
// Embedding Models
// ============================================

export interface VectorEmbedding {
  id: string;
  correspondenceId: string;
  textChunk: string;
  embeddingVector: number[];
  modelName: string;
  chunkIndex: number;
  language: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

// ============================================
// Search & Query Models
// ============================================

export interface SearchRequest {
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

export interface SearchResult {
  id: string;
  mailNum: string;
  mailDate: string;
  subject: string;
  bodyText: string;
  correspondenceType: string;
  secrecyLevel: string;
  priorityLevel: string;
  personalityLevel: string;
  similarityScore: number;
  highlights?: string[];
}

export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  language: string;
  metadata?: {
    queryProcessingTime: number;
    embeddingTime: number;
    searchTime: number;
    generationTime: number;
  };
}

// ============================================
// Sync Models
// ============================================

export interface SyncRequest {
  type: 'full' | 'incremental';
  batchSize?: number;
  fromDate?: string;
  toDate?: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  duration: string;
  errors?: string[];
}

// ============================================
// Status Models
// ============================================

export interface SystemStatus {
  qdrant: {
    connected: boolean;
    collections: Record<string, number>;
  };
  ollama: {
    connected: boolean;
    models: string[];
  };
  postgres: {
    connected: boolean;
  };
}

// ============================================
// Chunk Models
// ============================================

export interface TextChunk {
  text: string;
  index: number;
  metadata?: Record<string, any>;
}

// ============================================
// User Guide Models
// ============================================

export interface UserGuideEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Conversation Models
// ============================================

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

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SearchResult[];
  metadata?: {
    queryProcessingTime?: number;
    embeddingTime?: number;
    searchTime?: number;
    generationTime?: number;
  };
  createdAt: Date;
}

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

export interface ConversationListRequest {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface ConversationResponse {
  conversation: Conversation;
  messages: ConversationMessage[];
}

// ============================================
// API Response Models
// ============================================

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

// ============================================
// Enums
// ============================================

export enum CorrespondenceType {
  Internal = 'Internal',
  IncomingExternal = 'IncomingExternal',
  OutgoingExternal = 'OutgoingExternal',
}

export enum CorrespondenceStatus {
  PendingReferral = 'PendingReferral',
  UnderProcessing = 'UnderProcessing',
  Completed = 'Completed',
  Rejected = 'Rejected',
  ReturnedForModification = 'ReturnedForModification',
  Postponed = 'Postponed',
}

export enum SecrecyLevel {
  None = 'None',
  Secret = 'Secret',
  TopSecret = 'TopSecret',
}

export enum PriorityLevel {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent',
}

export enum ActionType {
  RegisterIncoming = 'RegisterIncoming',
  RequestApproval = 'RequestApproval',
  Action = 'Action',
  Reject = 'Reject',
  Return = 'Return',
  Send = 'Send',
  Archive = 'Archive',
  TakeUnderConsideration = 'TakeUnderConsideration',
  RequestInformation = 'RequestInformation',
  SendToExternalReferral = 'SendToExternalReferral',
  SendToInternalReferral = 'SendToInternalReferral',
}

export enum WorkflowStepStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Rejected = 'Rejected',
  Delegated = 'Delegated',
  Returned = 'Returned',
}
