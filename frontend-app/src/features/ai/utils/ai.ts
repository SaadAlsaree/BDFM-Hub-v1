import { aiService } from '../api/ai.service';
import type { SearchRequest } from '../types/ai';

export interface AIResponseOptions {
    data: {
        messages: Array<{
            role: 'user' | 'assistant' | 'system';
            content: string;
        }>;
    };
}

/**
 * Generate AI response using the RAG service
 * This function adapts the chat messages format to work with our RAG API
 */
export async function genAIResponse(options: AIResponseOptions): Promise<Response> {
    try {
        // Extract the latest user message for the query
        const userMessages = options.data.messages.filter(msg => msg.role === 'user');
        const latestQuery = userMessages[userMessages.length - 1]?.content || '';

        if (!latestQuery.trim()) {
            throw new Error('No user query found in messages');
        }

        // Create search request for RAG API
        const searchRequest: SearchRequest = {
            query: latestQuery,
            language: 'ar', // Default to English, could be made configurable
            maxResults: 5,
            similarityThreshold: 0.7
        };

        // Call the RAG service
        const ragResponse = await aiService.queryRAG(searchRequest);

        if (!ragResponse) {
            // Return a mock response for testing when API is not available
            console.warn('AI Service: No response from RAG service, returning mock response');
            const mockResponseData = {
                choices: [{
                    message: {
                        role: 'assistant',
                        content: `عذراً، لا يمكنني الوصول إلى قاعدة البيانات في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً.\n\n(هذا رد تجريبي - API غير متاح)`,
                        tool_calls: null
                    },
                    finish_reason: 'stop'
                }],
                usage: {
                    prompt_tokens: latestQuery.length,
                    completion_tokens: 50,
                    total_tokens: latestQuery.length + 50
                }
            };

            return new Response(JSON.stringify(mockResponseData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        if (!ragResponse.data) {
            throw new Error('Invalid response structure from RAG service');
        }

        if (!ragResponse.data.answer) {
            throw new Error('No answer provided by RAG service');
        }

        // Format response to match expected chat format
        const responseData = {
            choices: [{
                message: {
                    role: 'assistant',
                    content: ragResponse.data.answer,
                    sources: ragResponse.data.sources || [],
                    tool_calls: null
                },
                finish_reason: 'stop'
            }],
            usage: {
                prompt_tokens: latestQuery.length,
                completion_tokens: ragResponse.data.answer.length,
                total_tokens: latestQuery.length + ragResponse.data.answer.length
            }
        };

        // Return a Response object that mimics the AI SDK expected format
        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Error generating AI response:', error);

        // Return error response
        const errorResponse = {
            error: {
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                type: 'ai_response_error',
                code: 'internal_error'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

/**
 * Generate streaming AI response (placeholder for future implementation)
 */
export async function genAIResponseStream(options: AIResponseOptions): Promise<Response> {
    // For now, return the same as non-streaming
    // TODO: Implement actual streaming when backend supports it
    return genAIResponse(options);
}
