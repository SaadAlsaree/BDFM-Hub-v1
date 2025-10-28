'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Mic, Square, Loader2, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useVoiceInput } from '../hooks/use-voice-input';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoiceMessage?: (audioFile: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showVoice?: boolean;
}

export function ChatInput({
  onSend,
  onVoiceMessage,
  isLoading = false,
  disabled = false,
  placeholder = 'اكتب رسالتك هنا...',
  maxLength = 4000,
  showVoice = true
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    isTranscribing,
    transcript,
    audioLevel,
    startRecording,
    stopRecording,
    clearTranscript,
    isSupported: isVoiceSupported
  } = useVoiceInput({
    onTranscript: (text) => {
      setMessage(text);
      // Auto-focus textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    },
    language: 'auto'
  });

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
      clearTranscript();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);

      // Auto-resize
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onVoiceMessage) {
      onVoiceMessage(file);
    }
    // Reset input
    e.target.value = '';
  };

  const isDisabled = disabled || isLoading || isTranscribing;
  const showCharCount = message.length > maxLength * 0.8;

  return (
    <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 relative border-t backdrop-blur'>
      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className='absolute -top-12 right-0 left-0 flex items-center justify-center'>
          <Badge
            variant='default'
            className='animate-in fade-in slide-in-from-bottom-2 gap-2 px-4 py-2'
          >
            <div className='flex gap-1'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='bg-primary-foreground w-1 rounded-full transition-all'
                  style={{
                    height: `${12 + audioLevel * 20}px`,
                    animationDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>
            <span>جاري التسجيل...</span>
          </Badge>
        </div>
      )}

      {/* Transcription Status */}
      {isTranscribing && (
        <div className='absolute -top-12 right-0 left-0 flex items-center justify-center'>
          <Badge
            variant='secondary'
            className='animate-in fade-in gap-2 px-4 py-2'
          >
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            <span>جاري تحويل الصوت...</span>
          </Badge>
        </div>
      )}

      <div className='container max-w-4xl py-4'>
        <div className='flex items-end gap-2'>
          {/* Voice Input Button */}
          {showVoice && isVoiceSupported && (
            <Button
              type='button'
              size='icon'
              variant={isRecording ? 'destructive' : 'outline'}
              className={cn(
                'h-10 w-10 shrink-0 rounded-full transition-all',
                isRecording && 'animate-pulse'
              )}
              onClick={handleVoiceToggle}
              disabled={isDisabled}
              title={isRecording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
            >
              {isRecording ? (
                <Square className='h-4 w-4' />
              ) : (
                <Mic className='h-4 w-4' />
              )}
            </Button>
          )}

          {/* File Upload (hidden) */}
          <input
            ref={fileInputRef}
            type='file'
            accept='audio/*'
            className='hidden'
            onChange={handleFileSelect}
          />

          {/* Attachment Button (for audio files) */}
          {showVoice && onVoiceMessage && (
            <Button
              type='button'
              size='icon'
              variant='outline'
              className='h-10 w-10 shrink-0 rounded-full'
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              title='رفع ملف صوتي'
            >
              <Paperclip className='h-4 w-4' />
            </Button>
          )}

          {/* Text Input */}
          <div className='relative flex-1'>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isDisabled}
              className={cn(
                'max-h-[200px] min-h-[44px] resize-none rounded-2xl pr-12',
                'focus-visible:ring-ring focus-visible:ring-1',
                'scrollbar-thin scrollbar-thumb-rounded'
              )}
              rows={1}
            />

            {/* Character Count */}
            {showCharCount && (
              <div
                className={cn(
                  'absolute right-3 bottom-2 text-[10px] font-medium',
                  message.length >= maxLength
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            type='submit'
            size='icon'
            className='h-10 w-10 shrink-0 rounded-full'
            onClick={handleSend}
            disabled={isDisabled || !message.trim()}
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <p className='text-muted-foreground mt-2 px-1 text-[11px]'>
          اضغط Enter للإرسال، Shift+Enter للسطر الجديد
        </p>
      </div>
    </div>
  );
}
