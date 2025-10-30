'use client';

import { useLocalRuntime } from '@assistant-ui/react';

export interface UseAiChatOptions {
    onError?: (error: Error) => void;
}

/**
 * Custom hook for AI chat with RAG system integration
 * Uses @assistant-ui/react's useLocalRuntime with custom adapter
 */
export function useAiChat() {
    const runtime = useLocalRuntime({
        async *run({ messages, abortSignal }) {
            // Call our API endpoint
            const response = await fetch('/api/ai-assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages }),
                signal: abortSignal
            });

            if (!response.ok) {
                throw new Error(`خطأ في الاتصال: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('فشل في قراءة الاستجابة');
            }

            const decoder = new TextDecoder();
            let accumulatedText = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });

                    // Parse JSON chunks from RAG system
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (!line.trim() || !line.startsWith('data: ')) continue;

                        try {
                            const jsonStr = line.replace('data: ', '').trim();
                            const data = JSON.parse(jsonStr);

                            // Handle different message types from RAG system
                            if (data.type === 'answer_chunk' && data.content) {
                                // Format dates in the content
                                let formattedContent = data.content;

                                // Replace ISO date format with readable Arabic format
                                formattedContent = formattedContent.replace(
                                    /(\d{4})[-‑](\d{2})[-‑](\d{2})T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
                                    (_match: string, year: string, month: string, day: string) => {
                                        return `${day}/${month}/${year}`;
                                    }
                                );

                                accumulatedText += formattedContent;
                                yield {
                                    content: [
                                        {
                                            type: 'text' as const,
                                            text: accumulatedText
                                        }
                                    ]
                                };
                            } else if (data.type === 'error') {
                                throw new Error(data.content || 'خطأ من الخادم');
                            }
                            // Ignore answer_end, sources, etc.
                        } catch (parseError) {
                            // Skip invalid JSON lines
                            continue;
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        }
    });

    return runtime;
}
