'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageSquare,
  Plus,
  Trash2,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AIAssistantService from '../api/ai-assistant.service';
import type { Conversation } from '../types';

interface ConversationListProps {
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onNew: () => void;
  className?: string;
}

export function ConversationList({
  selectedId,
  onSelect,
  onNew,
  className
}: ConversationListProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      loadConversations();
    }
  }, [session?.user?.id]);

  const loadConversations = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const data = await AIAssistantService.listConversations(session.user.id);
      setConversations(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل في تحميل المحادثات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
      return;
    }

    if (!session?.user?.id) return;

    try {
      await AIAssistantService.deleteConversation(
        conversationId,
        session.user.id
      );
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      toast.success('تم حذف المحادثة');

      // If deleted conversation was selected, trigger new conversation
      if (conversationId === selectedId) {
        onNew();
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في حذف المحادثة');
    }
  };

  return (
    <div className={cn('bg-muted/30 flex h-full flex-col border-l', className)}>
      {/* Header */}
      <div className='flex items-center justify-between gap-2 border-b p-4'>
        <div className='flex items-center gap-2'>
          <MessageSquare className='text-primary h-5 w-5' />
          <h3 className='font-semibold'>المحادثات</h3>
        </div>
        <Button
          size='icon'
          variant='ghost'
          onClick={onNew}
          title='محادثة جديدة'
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className='flex-1'>
        {isLoading ? (
          <div className='flex items-center justify-center p-8'>
            <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
          </div>
        ) : conversations.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-8 text-center'>
            <MessageSquare className='text-muted-foreground/50 mb-3 h-12 w-12' />
            <p className='text-muted-foreground mb-4 text-sm'>
              لا توجد محادثات بعد
            </p>
            <Button size='sm' onClick={onNew} className='gap-2'>
              <Plus className='h-4 w-4' />
              <span>ابدأ محادثة</span>
            </Button>
          </div>
        ) : (
          <div className='space-y-1 p-2'>
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg p-3 text-right transition-colors',
                  'hover:bg-accent/50',
                  conversation.id === selectedId && 'bg-accent'
                )}
              >
                <div className='bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full'>
                  <MessageSquare className='text-primary h-4 w-4' />
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <h4 className='truncate text-sm font-medium'>
                      {conversation.title}
                    </h4>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 shrink-0'
                        >
                          <MoreVertical className='h-3.5 w-3.5' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={(e) => handleDelete(conversation.id, e)}
                        >
                          <Trash2 className='ml-2 h-4 w-4' />
                          <span>حذف</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className='mt-1 flex items-center gap-2'>
                    <span className='text-muted-foreground text-xs'>
                      {conversation.messageCount} رسالة
                    </span>
                    {conversation.lastMessageAt && (
                      <>
                        <span className='text-muted-foreground text-xs'>•</span>
                        <span className='text-muted-foreground text-xs'>
                          {new Date(
                            conversation.lastMessageAt
                          ).toLocaleDateString('ar-SA', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
