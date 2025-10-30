import { NextRequest } from 'next/server';

const RAG_BASE_URL =
    process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:3001/api/rag';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        // Get the last user message
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
            return new Response('Invalid message format', { status: 400 });
        }

        // Extract text content from message
        let queryText = '';
        if (typeof lastMessage.content === 'string') {
            queryText = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
            // Handle content array format from assistant-ui
            const textContent = lastMessage.content.find(
                (c: any) => c.type === 'text'
            );
            queryText = textContent?.text || '';
        }

        if (!queryText || !queryText.trim()) {
            return new Response('Empty message', { status: 400 });
        }

        // Call the RAG streaming endpoint
        const response = await fetch(`${RAG_BASE_URL}/query/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: queryText.trim(),
                language: 'ar', // Default to Arabic, can be dynamic
                maxResults: 5,
                similarityThreshold: 0.7
            })
        });

        if (!response.ok || !response.body) {
            throw new Error('فشل في الاتصال بخدمة الذكاء الاصطناعي');
        }

        // Return the stream directly with proper headers
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            }
        });
    } catch (error) {
        // Log error for debugging
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('AI Chat Error:', error);
        }
        return new Response('حدث خطأ في معالجة الطلب', { status: 500 });
    }
}
