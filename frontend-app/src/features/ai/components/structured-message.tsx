'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff, FileText } from 'lucide-react';
import { useStore } from '@tanstack/react-store';
import { showThinking, assistantStore } from '../store/assistant';

interface StructuredMessageProps {
  content: string;
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
  language?: 'ar' | 'en';
  onCopy?: (content: string) => void;
  onSpeak?: (content: string) => void;
  voiceEnabled?: boolean;
}

export default function StructuredMessage({
  content,
  sources,
  language = 'ar',
  onCopy,
  onSpeak,
  voiceEnabled = false
}: StructuredMessageProps) {
  const globalShowThinking = useStore(showThinking);
  const [copied, setCopied] = React.useState(false);

  // Parse the content to separate thinking from response
  const parseContent = (text: string) => {
    const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/);
    const thinking = thinkMatch ? thinkMatch[1].trim() : null;
    const response = thinkMatch
      ? text.replace(/<think>[\s\S]*?<\/think>/, '').trim()
      : text;

    return { thinking, response };
  };

  const { thinking, response } = parseContent(content);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatText = (text: string) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>'
      )
      .replace(/\n/g, '<br />');
  };

  const config = {
    ar: {
      thinking: 'التفكير',
      sources: 'مصادر المعلومات',
      copy: 'نسخ',
      copied: 'تم النسخ',
      moreSources: 'مصدر إضافي',
      sourcesCount: 'مصادر إضافية'
    },
    en: {
      thinking: 'Thinking',
      sources: 'Information Sources',
      copy: 'Copy',
      copied: 'Copied!',
      moreSources: 'more sources',
      sourcesCount: 'additional sources'
    }
  };

  return (
    <div className='space-y-3'>
      {/* Thinking Section */}
      {thinking && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-3 dark:bg-blue-950/20'
        >
          <div className='mb-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-blue-500' />
              <span className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                {config[language].thinking}
              </span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={assistantStore.toggleThinking}
              className='h-6 w-6 p-0'
            >
              {globalShowThinking ? (
                <EyeOff className='h-3 w-3' />
              ) : (
                <Eye className='h-3 w-3' />
              )}
            </Button>
          </div>

          {globalShowThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='prose prose-sm max-w-none text-sm text-blue-600 dark:text-blue-400'
              dangerouslySetInnerHTML={{ __html: formatText(thinking) }}
            />
          )}
        </motion.div>
      )}

      {/* Main Response */}
      <div className='prose prose-sm dark:prose-invert max-w-none'>
        <div
          className='break-words whitespace-pre-wrap'
          dangerouslySetInnerHTML={{ __html: formatText(response) }}
        />
      </div>

      {/* Sources Section */}
      {sources && sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='border-border/30 border-t pt-3'
        >
          <div className='mb-3 flex items-center gap-2'>
            <FileText className='text-muted-foreground h-4 w-4' />
            <span className='text-muted-foreground text-sm font-medium'>
              {config[language].sources}
            </span>
            <Badge variant='secondary' className='text-xs'>
              {sources.length}
            </Badge>
          </div>

          <div className='grid gap-2'>
            {sources.slice(0, 3).map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className='bg-muted/50 rounded-lg p-3 text-sm'
              >
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground font-medium'>
                      #{source.mailNum}
                    </span>
                    <Badge variant='outline' className='text-xs'>
                      {(source.similarityScore * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {new Date(source.mailDate).toLocaleDateString(
                      language === 'ar' ? 'ar-SA' : 'en-US',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }
                    )}
                  </div>
                </div>

                <div className='text-foreground mb-1 font-medium'>
                  {source.subject}
                </div>

                {source.bodyText && source.bodyText !== source.subject && (
                  <div className='text-muted-foreground line-clamp-2 text-xs'>
                    {source.bodyText}
                  </div>
                )}

                <div className='mt-2 flex gap-1'>
                  <Badge variant='outline' className='text-xs'>
                    {source.priorityLevel}
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    {source.secrecyLevel}
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    {source.personalityLevel}
                  </Badge>
                </div>
              </motion.div>
            ))}

            {sources.length > 3 && (
              <div className='text-muted-foreground py-2 text-center text-xs'>
                +{sources.length - 3} {config[language].sourcesCount}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className='flex items-center gap-2 pt-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleCopy}
          className='h-8 px-3 text-xs'
        >
          <Copy className='mr-1 h-3 w-3' />
          {copied ? config[language].copied : config[language].copy}
        </Button>

        {voiceEnabled && onSpeak && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onSpeak(response)}
            className='h-8 px-3 text-xs'
          >
            <FileText className='mr-1 h-3 w-3' />
            {language === 'ar' ? 'قراءة' : 'Read'}
          </Button>
        )}
      </div>
    </div>
  );
}
