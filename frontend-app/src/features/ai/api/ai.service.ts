import { axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';
import { SearchRequest, RAGResponse } from '../types/ai';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/api';

/**
 * AI Service for RAG (Retrieval-Augmented Generation) operations
 * Provides methods for querying the AI backend with proper error handling
 */
export const aiService = {
    /**
     * Query RAG endpoint for AI responses
     * @param request - Search request parameters
     * @returns Promise<IResponse<RAGResponse> | null>
     */
    async queryRAG(request: SearchRequest): Promise<IResponse<RAGResponse> | null> {
        try {
            // Validate request parameters
            if (!request.query?.trim()) {
                console.error('AI Service: Empty query provided');
                return null;
            }

            console.log('AI Service: Making request to:', `${baseUrl}/RAG/query`);
            console.log('AI Service: Request payload:', JSON.stringify(request, null, 2));

            const response = await axiosClient.post(`${baseUrl}/RAG/query`, request, {
                timeout: 60000 // 60 seconds timeout for AI processing
            });

            console.log('AI Service: Response status:', response.status);
            console.log('AI Service: Response headers:', response.headers);

            if (response.status >= 400) {
                console.error('AI Service: RAG query failed with status:', response.status, response.statusText);
                console.error('AI Service: Error response:', response.data);
                return null;
            }

            const data = response.data;

            console.log('AI Service: Response data:', JSON.stringify(data, null, 2));

            // Check if the response has the expected structure
            if (data?.answer) {
                // Direct response format (what we're getting)
                return {
                    data: {
                        answer: data.answer,
                        sources: data.sources || [],
                        language: data.language || 'ar'
                    }
                } as IResponse<RAGResponse>;
            } else if (data?.data?.answer) {
                // Wrapped response format (expected format)
                return data as IResponse<RAGResponse>;
            } else {
                console.warn('AI Service: Invalid response structure received');
                return null;
            }
        } catch (error) {
            console.error('AI Service: Error querying RAG endpoint:', error);

            // Log additional context for debugging
            if (error instanceof Error) {
                console.error('AI Service: Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
            }

            // Check if it's a timeout error
            if (error instanceof Error && error.message?.includes('timeout')) {
                console.error('AI Service: Request timeout - AI processing is taking longer than expected');
            }

            // Check if it's a network error
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error('AI Service: Network error - API endpoint may not be available');
            }

            return null;
        }
    },

    /**
     * Query RAG streaming endpoint for real-time AI responses
     * @param request - Search request parameters
     * @returns Promise<ReadableStream | null>
     */
    async queryRAGStream(request: SearchRequest): Promise<ReadableStream | null> {
        try {
            // Validate request parameters
            if (!request.query?.trim()) {
                console.error('AI Service: Empty query provided for streaming');
                return null;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

            const response = await fetch(`${baseUrl}/RAG/query/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/stream'
                },
                body: JSON.stringify(request),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('AI Service: RAG stream query failed with status:', response.status, response.statusText);
                return null;
            }

            if (!response.body) {
                console.error('AI Service: No response body received for streaming');
                return null;
            }

            return response.body;
        } catch (error) {
            console.error('AI Service: Error querying RAG streaming endpoint:', error);

            // Log additional context for debugging
            if (error instanceof Error) {
                console.error('AI Service: Streaming error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
            }

            return null;
        }
    },

    /**
     * Health check for AI service availability
     * @returns Promise<boolean>
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await axiosClient.get(`${baseUrl}/health`, {
                timeout: 10000 // 10 seconds for health check
            });
            return response.status === 200;
        } catch (error) {
            console.error('AI Service: Health check failed:', error);
            return false;
        }
    }
}
