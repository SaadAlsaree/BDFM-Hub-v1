'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@tanstack/react-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Copy,
  RefreshCw,
  Languages,
  Volume2,
  VolumeX,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  showAIAssistant,
  showThinking,
  assistantStore
} from '../store/assistant';
import { genAIResponse } from '../utils/ai';
import StructuredMessage from './structured-message';

import { cn } from '@/lib/utils';

// Message interface for our chat
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  sources?: Array<{
    id: string;
    mailNum: string;
    mailDate: string;
    subject: string;
    bodyText: string;
    correspondenceType: string;
    secrecyLevel: string;
    priorityLevel: string;
    personalityLevel: string;
    language: string;
    fileId: string;
    createdAt: string;
    similarityScore: number;
    metadata: Record<string, any>;
  }>;
}

// Arabic language configuration
const ARABIC_CONFIG = {
  direction: 'rtl' as const,
  fontFamily: 'Noto Sans Arabic, system-ui, sans-serif',
  placeholder: 'اكتب سؤالك هنا...',
  sendButton: 'إرسال',
  clearChat: 'مسح المحادثة',
  minimize: 'تصغير',
  maximize: 'تكبير',
  close: 'إغلاق',
  copy: 'نسخ',
  retry: 'إعادة المحاولة',
  toggleLanguage: 'تغيير اللغة',
  toggleVoice: 'تشغيل/إيقاف الصوت',
  assistant: 'المساعد الذكي',
  you: 'أنت',
  thinking: 'جاري التفكير...',
  error: 'حدث خطأ، يرجى المحاولة مرة أخرى',
  welcome: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
  show: 'إظهار',
  hide: 'إخفاء'
};

const ENGLISH_CONFIG = {
  direction: 'ltr' as const,
  fontFamily: 'system-ui, sans-serif',
  placeholder: 'Type your question here...',
  sendButton: 'Send',
  clearChat: 'Clear Chat',
  minimize: 'Minimize',
  maximize: 'Maximize',
  close: 'Close',
  copy: 'Copy',
  retry: 'Retry',
  toggleLanguage: 'Toggle Language',
  toggleVoice: 'Toggle Voice',
  assistant: 'AI Assistant',
  you: 'You',
  thinking: 'Thinking...',
  error: 'An error occurred, please try again',
  welcome: 'Hello! How can I help you today?',
  show: 'Show',
  hide: 'Hide'
};

interface AIAssistantProps {
  className?: string;
  defaultLanguage?: 'ar' | 'en';
  showWelcomeMessage?: boolean;
}

export default function AIAssistant({
  className,
  defaultLanguage = 'ar',
  showWelcomeMessage = true
}: AIAssistantProps) {
  const isVisible = useStore(showAIAssistant);
  const isThinkingVisible = useStore(showThinking);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>(defaultLanguage);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(
    showWelcomeMessage
      ? [
          {
            id: 'welcome',
            role: 'assistant',
            content:
              language === 'ar'
                ? ARABIC_CONFIG.welcome
                : ENGLISH_CONFIG.welcome,
            timestamp: new Date()
          }
        ]
      : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = language === 'ar' ? ARABIC_CONFIG : ENGLISH_CONFIG;

  // Update welcome message when language changes
  useEffect(() => {
    if (showWelcomeMessage && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: config.welcome,
          timestamp: new Date()
        }
      ]);
    }
  }, [language, config.welcome, showWelcomeMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when assistant opens
  useEffect(() => {
    if (isVisible && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible, isMinimized]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const response = await genAIResponse({
        data: {
          messages: [
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: input.trim() }
          ]
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 'Failed to get response from AI service'
        );
      }

      const data = await response.json();

      // Check if the response has an error
      if (data.error) {
        throw new Error(data.error.message || 'AI service error');
      }

      // Check if we have a valid response
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response format from AI service');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
        sources: data.choices[0].message.sources || []
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(config.error);

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: config.error,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Copy message to clipboard
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Clear all messages
  const clearChat = () => {
    setMessages(
      showWelcomeMessage
        ? [
            {
              id: 'welcome',
              role: 'assistant',
              content: config.welcome,
              timestamp: new Date()
            }
          ]
        : []
    );
    setError(null);
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // Text-to-speech for Arabic/English
  const speakMessage = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  // Retry last message
  const reload = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages
        .slice()
        .reverse()
        .find((msg) => msg.role === 'user');

      if (lastUserMessage) {
        setInput(lastUserMessage.content);
        // Remove the last assistant message if it was an error
        const lastMessage = messages[messages.length - 1];
        if (
          lastMessage.role === 'assistant' &&
          lastMessage.content === config.error
        ) {
          setMessages((prev) => prev.slice(0, -1));
        }
      }
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to toggle AI Assistant
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        assistantStore.toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed bottom-4 left-4 z-50 w-96 max-w-[calc(100vw-2rem)]',
            'bg-background border-border rounded-lg border shadow-2xl',
            'bg-background/95 backdrop-blur-sm',
            language === 'ar' && 'font-arabic',
            className
          )}
          style={{
            direction: config.direction,
            fontFamily: config.fontFamily
          }}
        >
          {/* Header */}
          <CardHeader className='flex flex-row items-center justify-between space-y-0 border-b px-4 py-3 pb-2'>
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <Bot className='text-primary h-5 w-5' />
                {isLoading && (
                  <motion.div
                    className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500'
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </div>
              <h3 className='text-sm font-semibold'>{config.assistant}</h3>
              {isTyping && (
                <Badge variant='secondary' className='px-2 py-0.5 text-xs'>
                  {config.thinking}
                </Badge>
              )}
            </div>

            <div className='flex items-center gap-1'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={assistantStore.toggleThinking}
                    className='h-8 w-8 p-0'
                  >
                    {isThinkingVisible ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isThinkingVisible ? config.hide : config.show}{' '}
                  {config.thinking}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={toggleLanguage}
                    className='h-8 w-8 p-0'
                  >
                    <Languages className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{config.toggleLanguage}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className='h-8 w-8 p-0'
                  >
                    {voiceEnabled ? (
                      <Volume2 className='h-4 w-4' />
                    ) : (
                      <VolumeX className='h-4 w-4' />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{config.toggleVoice}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsMinimized(!isMinimized)}
                    className='h-8 w-8 p-0'
                  >
                    {isMinimized ? (
                      <Maximize2 className='h-4 w-4' />
                    ) : (
                      <Minimize2 className='h-4 w-4' />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isMinimized ? config.maximize : config.minimize}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={assistantStore.hide}
                    className='h-8 w-8 p-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{config.close}</TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          {/* Chat Messages */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className='p-0'>
                  <ScrollArea className='h-96 px-4 py-2'>
                    <div className='space-y-4'>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            'flex gap-3',
                            message.role === 'user' &&
                              language === 'ar' &&
                              'flex-row-reverse',
                            message.role === 'user' &&
                              language === 'en' &&
                              'flex-row-reverse'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                              message.role === 'assistant'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {message.role === 'assistant' ? (
                              <Bot className='h-4 w-4' />
                            ) : (
                              <User className='h-4 w-4' />
                            )}
                          </div>

                          <div
                            className={cn(
                              'flex-1 space-y-2',
                              message.role === 'user' && 'text-right'
                            )}
                          >
                            {message.role === 'assistant' ? (
                              <div className='w-full'>
                                <StructuredMessage
                                  content={message.content}
                                  sources={message.sources}
                                  language={language}
                                  onCopy={copyMessage}
                                  onSpeak={speakMessage}
                                  voiceEnabled={voiceEnabled}
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  'inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm',
                                  'bg-primary text-primary-foreground ml-auto'
                                )}
                              >
                                <p className='break-words whitespace-pre-wrap'>
                                  {message.content}
                                </p>
                              </div>
                            )}

                            <div
                              className={cn(
                                'text-muted-foreground flex items-center gap-2 text-xs',
                                message.role === 'user' && 'justify-end'
                              )}
                            >
                              <span>
                                {message.role === 'assistant'
                                  ? config.assistant
                                  : config.you}
                              </span>
                              <span>•</span>
                              <span>
                                {message.timestamp?.toLocaleTimeString(
                                  language === 'ar' ? 'ar-SA' : 'en-US',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }
                                )}
                              </span>

                              {/* Action buttons are now handled by StructuredMessage component */}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className='bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg p-3 text-sm'
                        >
                          <span>{error}</span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={reload}
                            className='ml-auto h-6 w-6 p-0'
                          >
                            <RefreshCw className='h-3 w-3' />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  {/* Input Form */}
                  <div className='border-t p-4'>
                    <form onSubmit={onSubmit} className='flex gap-2'>
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        placeholder={config.placeholder}
                        disabled={isLoading}
                        className={cn(
                          'flex-1',
                          language === 'ar' && 'text-right'
                        )}
                        dir={config.direction}
                      />
                      <Button
                        type='submit'
                        disabled={!input.trim() || isLoading}
                        size='sm'
                        className='px-3'
                      >
                        {isLoading ? (
                          <RefreshCw className='h-4 w-4 animate-spin' />
                        ) : (
                          <Send className='h-4 w-4' />
                        )}
                      </Button>
                    </form>

                    {messages.length > 1 && (
                      <div className='mt-2 flex justify-center'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={clearChat}
                          className='text-muted-foreground hover:text-foreground text-xs'
                        >
                          {config.clearChat}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  );
}
