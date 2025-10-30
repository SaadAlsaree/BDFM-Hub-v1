'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useAiChat } from '../hooks/use-ai-chat';
import { AiMessageList } from './ai-message';
import { AiComposer } from './ai-composer';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BotIcon, Sparkles } from 'lucide-react';

export function AiChatbot() {
  const runtime = useAiChat();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Card className='flex h-[700px] w-full max-w-4xl flex-col overflow-hidden shadow-2xl'>
        {/* Header */}
        <div className='flex items-center gap-3 border-b bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-4 text-white'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
            <BotIcon className='h-5 w-5' />
          </div>
          <div className='flex-1' dir='rtl'>
            <h2 className='text-lg font-semibold'>مساعد نضام الاتمتة الذكي</h2>
            <p className='text-sm text-white/80'>اسأل عن المعاملات و الكتب</p>
          </div>
          <Sparkles className='h-5 w-5 animate-pulse' />
        </div>

        <Separator />

        {/* Messages Area */}
        <div className='min-h-0 flex-1'>
          <AiMessageList />
        </div>

        {/* Input Composer */}
        <AiComposer />
      </Card>
    </AssistantRuntimeProvider>
  );
}
