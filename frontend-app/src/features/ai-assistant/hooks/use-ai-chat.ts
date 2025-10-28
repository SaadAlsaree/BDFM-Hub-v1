import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import AIAssistantService from '../api/ai-assistant.service';
import type {
  Message,
  Conversation,
  SendMessageRequest,
  QueryRequest
} from '../types';

export function useAIChat(conversationId?: string) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversation if conversationId is provided
  useEffect(() => {
    if (conversationId && session?.user?.id) {
      loadConversation(conversationId);
    }
  }, [conversationId, session?.user?.id]);

  /**
   * Load conversation with messages
   */
  const loadConversation = useCallback(
    async (id: string) => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await AIAssistantService.getConversation(
          id,
          session.user.id
        );
        setConversation(response.conversation);
        setMessages(response.messages);
      } catch (err: any) {
        const errorMsg = err.message || 'فشل في تحميل المحادثة';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [session?.user?.id]
  );

  /**
   * Create new conversation
   */
  const createConversation = useCallback(
    async (title?: string, language: 'ar' | 'en' = 'ar') => {
      if (!session?.user?.id) {
        toast.error('يجب تسجيل الدخول أولاً');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const newConversation = await AIAssistantService.createConversation({
          userId: session.user.id,
          title,
          language
        });
        setConversation(newConversation);
        setMessages([]);
        return newConversation;
      } catch (err: any) {
        const errorMsg = err.message || 'فشل في إنشاء المحادثة';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [session?.user?.id]
  );

  /**
   * Send message without conversation (direct query)
   */
  const sendQuery = useCallback(
    async (query: string, options?: Partial<QueryRequest>) => {
      try {
        setIsLoading(true);
        setIsTyping(true);
        setError(null);

        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: query,
          createdAt: new Date()
        };
        setMessages((prev) => [...prev, userMessage]);

        // Query RAG system
        const response = await AIAssistantService.query({
          query,
          language: 'ar',
          ...options
        });

        // Add assistant message
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          metadata: response.metadata,
          createdAt: new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);

        return assistantMessage;
      } catch (err: any) {
        const errorMsg = err.message || 'فشل في إرسال الاستعلام';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    []
  );

  /**
   * Send message in conversation
   */
  const sendMessage = useCallback(
    async (message: string, options?: Partial<SendMessageRequest>) => {
      if (!conversation || !session?.user?.id) {
        toast.error('لا توجد محادثة نشطة');
        return null;
      }

      try {
        setIsLoading(true);
        setIsTyping(true);
        setError(null);

        // Add user message immediately
        const userMessage: Message = {
          id: Date.now().toString(),
          conversationId: conversation.id,
          role: 'user',
          content: message,
          createdAt: new Date()
        };
        setMessages((prev) => [...prev, userMessage]);

        // Send to server
        const assistantMessage = await AIAssistantService.sendMessage({
          conversationId: conversation.id,
          userId: session.user.id,
          message,
          ...options
        });

        // Add assistant message
        setMessages((prev) => [...prev, assistantMessage]);

        return assistantMessage;
      } catch (err: any) {
        const errorMsg = err.message || 'فشل في إرسال الرسالة';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [conversation, session?.user?.id]
  );

  /**
   * Send message with streaming
   */
  const sendMessageStream = useCallback(
    async (
      message: string,
      onToken?: (token: string) => void,
      options?: Partial<SendMessageRequest>
    ) => {
      if (!conversation || !session?.user?.id) {
        toast.error('لا توجد محادثة نشطة');
        return;
      }

      try {
        setIsLoading(true);
        setIsTyping(true);
        setError(null);

        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          conversationId: conversation.id,
          role: 'user',
          content: message,
          createdAt: new Date()
        };
        setMessages((prev) => [...prev, userMessage]);

        // Start streaming
        const stream = await AIAssistantService.sendMessageStream({
          conversationId: conversation.id,
          userId: session.user.id,
          message,
          ...options
        });

        // Create assistant message placeholder
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          conversationId: conversation.id,
          role: 'assistant',
          content: '',
          createdAt: new Date(),
          isStreaming: true
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Read stream
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'token') {
                fullContent += data.content;
                onToken?.(data.content);

                // Update message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              } else if (data.type === 'done') {
                // Final message with sources
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          isStreaming: false,
                          sources: data.sources,
                          metadata: data.metadata
                        }
                      : msg
                  )
                );
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            }
          }
        }
      } catch (err: any) {
        const errorMsg = err.message || 'فشل في إرسال الرسالة';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [conversation, session?.user?.id]
  );

  /**
   * Update conversation title
   */
  const updateTitle = useCallback(
    async (title: string) => {
      if (!conversation || !session?.user?.id) return;

      try {
        const updated = await AIAssistantService.updateConversationTitle(
          conversation.id,
          session.user.id,
          title
        );
        setConversation(updated);
        toast.success('تم تحديث العنوان');
      } catch (err: any) {
        toast.error(err.message || 'فشل في تحديث العنوان');
      }
    },
    [conversation, session?.user?.id]
  );

  /**
   * Delete conversation
   */
  const deleteConversation = useCallback(async () => {
    if (!conversation || !session?.user?.id) return;

    try {
      await AIAssistantService.deleteConversation(
        conversation.id,
        session.user.id
      );
      setConversation(null);
      setMessages([]);
      toast.success('تم حذف المحادثة');
    } catch (err: any) {
      toast.error(err.message || 'فشل في حذف المحادثة');
    }
  }, [conversation, session?.user?.id]);

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Stop current operation
   */
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setIsTyping(false);
    }
  }, []);

  return {
    messages,
    conversation,
    isLoading,
    isTyping,
    error,
    loadConversation,
    createConversation,
    sendQuery,
    sendMessage,
    sendMessageStream,
    updateTitle,
    deleteConversation,
    clearMessages,
    stop
  };
}
