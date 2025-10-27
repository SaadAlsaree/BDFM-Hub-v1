'use client';

import { memo } from 'react';
import { Bot, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

function ChatMessageComponent({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const hasSources = message.sources && message.sources.length > 0;

  return (
    <div
      className={cn(
        'flex gap-4 py-4 px-2 animate-in fade-in-50 slide-in-from-bottom-4',
        isUser ? 'flex-row-reverse' : 'flex-row',
        isLast && 'pb-8'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start', 'flex-1 max-w-[85%]')}>
        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 border border-border',
            message.isStreaming && 'animate-pulse'
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap break-words m-0 leading-relaxed">
              {message.content}
            </p>
          </div>

          {/* Voice indicator */}
          {message.isVoice && (
            <Badge variant="secondary" className="mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-1.5" />
              رسالة صوتية
            </Badge>
          )}
        </div>

        {/* Metadata */}
        {message.metadata && isAssistant && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <CheckCircle className="h-3 w-3" />
            <span>
              {message.metadata.queryProcessingTime
                ? `${message.metadata.queryProcessingTime}ms`
                : 'معالجة'}
            </span>
          </div>
        )}

        {/* Sources */}
        {hasSources && isAssistant && (
          <Collapsible className="w-full">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1.5 px-2 text-xs gap-2"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{message.sources!.length} مصادر مرجعية</span>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2 space-y-2">
              {message.sources!.map((source) => (
                <Card
                  key={source.id}
                  className="p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-2">
                    {/* Source Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="shrink-0">
                            {source.mailNum}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(source.mailDate).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium mt-1 line-clamp-1">
                          {source.subject}
                        </h4>
                      </div>

                      {/* Similarity Score */}
                      <Badge
                        variant={source.similarityScore > 0.8 ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {(source.similarityScore * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    {/* Source Content */}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {source.bodyText}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px]',
                          source.priorityLevel === 'Urgent' && 'border-red-500 text-red-500',
                          source.priorityLevel === 'High' && 'border-orange-500 text-orange-500'
                        )}
                      >
                        {source.priorityLevel}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {source.correspondenceType}
                      </Badge>
                      {source.secrecyLevel !== 'None' && (
                        <Badge variant="outline" className="text-[10px] border-yellow-500 text-yellow-500">
                          {source.secrecyLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground px-1">
          {new Date(message.createdAt).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
