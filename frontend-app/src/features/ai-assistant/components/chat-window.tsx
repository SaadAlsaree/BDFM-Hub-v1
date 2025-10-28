'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  Trash2,
  Edit2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIChat } from '../hooks/use-ai-chat';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import type { Conversation } from '../types';

interface ChatWindowProps {
  conversation?: Conversation | null;
  onNewConversation?: () => void;
  onTitleChange?: (title: string) => void;
  onDeleteConversation?: () => void;
  className?: string;
}

export function ChatWindow({
  conversation,
  onNewConversation,
  onTitleChange,
  onDeleteConversation,
  className
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const {
    messages,
    isLoading,
    isTyping,
    error,
    sendMessage,
    sendMessageStream,
    updateTitle,
    clearMessages
  } = useAIChat(conversation?.id);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update title input when conversation changes
  useEffect(() => {
    if (conversation) {
      setTitleInput(conversation.title);
    }
  }, [conversation]);

  const handleSendMessage = async (message: string) => {
    await sendMessageStream(message);
  };

  const handleSaveTitle = async () => {
    if (titleInput.trim() && titleInput !== conversation?.title) {
      await updateTitle(titleInput.trim());
      onTitleChange?.(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleClearChat = () => {
    if (confirm('هل أنت متأكد من حذف جميع الرسائل؟')) {
      clearMessages();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={cn('bg-background flex h-full flex-col', className)}>
      {/* Header */}
      <div className='bg-muted/30 supports-[backdrop-filter]:bg-muted/20 border-b backdrop-blur'>
        <div className='container max-w-4xl py-4'>
          <div className='flex items-center justify-between gap-4'>
            {/* Title */}
            <div className='flex min-w-0 flex-1 items-center gap-3'>
              <div className='bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                <Sparkles className='text-primary h-5 w-5' />
              </div>

              {isEditingTitle && conversation ? (
                <input
                  type='text'
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setTitleInput(conversation.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className='border-border focus:border-primary flex-1 border-b bg-transparent px-2 py-1 text-lg font-semibold outline-none'
                  autoFocus
                />
              ) : (
                <div className='min-w-0 flex-1'>
                  <h2 className='truncate text-lg font-semibold'>
                    {conversation?.title || 'محادثة جديدة'}
                  </h2>
                  <p className='text-muted-foreground text-xs'>
                    {messages.length} رسالة
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className='flex items-center gap-2'>
              {conversation && (
                <>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setIsEditingTitle(true)}
                    title='تعديل العنوان'
                  >
                    <Edit2 className='h-4 w-4' />
                  </Button>

                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleClearChat}
                    disabled={isEmpty}
                    title='حذف الرسائل'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </>
              )}

              {onNewConversation && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onNewConversation}
                  className='gap-2'
                >
                  <MessageSquare className='h-4 w-4' />
                  <span>محادثة جديدة</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className='flex-1'>
        <div className='container max-w-4xl py-6'>
          {isEmpty ? (
            <div className='flex h-[calc(100vh-300px)] flex-col items-center justify-center text-center'>
              <div className='bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <Sparkles className='text-primary h-8 w-8' />
              </div>
              <h3 className='mb-2 text-xl font-semibold'>
                مرحباً! كيف يمكنني مساعدتك؟
              </h3>
              <p className='text-muted-foreground max-w-md'>
                اسألني أي سؤال عن الكتب, أو ابحث في قاعدة البيانات، أو احصل على
                إحصائيات مفصلة
              </p>

              {/* Suggested Questions */}
              <div className='mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2'>
                {[
                  'أرني الكتب العاجلة لهذا الأسبوع',
                  'ما هي الكتب المتأخرة؟',
                  'احصائيات الكتب لهذا الشهر',
                  'أرني الكتب السرية'
                ].map((question, i) => (
                  <Button
                    key={i}
                    variant='outline'
                    className='hover:bg-accent/50 h-auto justify-start px-6 py-4 text-right'
                    onClick={() => handleSendMessage(question)}
                  >
                    <span className='text-sm'>{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className='space-y-1'>
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}

              {isTyping && (
                <div className='animate-in fade-in flex gap-4 px-2 py-4'>
                  <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                    <Sparkles className='text-muted-foreground h-5 w-5 animate-pulse' />
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full [animation-delay:0ms]' />
                    <div className='bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full [animation-delay:150ms]' />
                    <div className='bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full [animation-delay:300ms]' />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant='destructive' className='mt-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        isLoading={isLoading || isTyping}
        disabled={!conversation}
        placeholder={
          conversation
            ? 'اكتب رسالتك أو اضغط على الميكروفون للتحدث...'
            : 'يرجى إنشاء محادثة جديدة أولاً'
        }
        showVoice={true}
      />
    </div>
  );
}
