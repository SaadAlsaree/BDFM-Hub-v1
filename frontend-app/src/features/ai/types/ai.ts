export interface SearchRequest {
  query: string;
  language: string;
  maxResults: number;
  similarityThreshold: number;
}

export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  language: string;
}

export interface SearchResult {
  id: string;
  mailNum: string;
  mailDate: string; // ISO string format recommended (e.g., '2025-08-02')
  subject: string;
  bodyText: string;
  correspondenceType: string;
  secrecyLevel: string;
  priorityLevel: string;
  personalityLevel: string;
  language: string;
  fileId: string;
  createdAt: string; // Also use ISO string
  similarityScore: number;
  metadata: Record<string, string>;
}
