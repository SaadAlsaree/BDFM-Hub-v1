/**
 * AI Assistant Examples
 * مجموعة من الأمثلة لاستخدام مكونات الـ AI Assistant
 */

// ============================================
// Example 1: Basic Usage - الاستخدام الأساسي
// ============================================

import { AiChatbot } from '@/features/ai-assistant/components';

export function BasicExample() {
  return (
    <div className='container mx-auto py-10'>
      <AiChatbot />
    </div>
  );
}

// ============================================
// Example 2: In Modal - داخل نافذة منبثقة
// ============================================

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export function ModalExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <MessageSquare className='ml-2 h-4 w-4' />
          افتح المساعد الذكي
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-4xl'>
        <AiChatbot />
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Example 3: With Custom Error Handling
// ============================================

import { useAiChat } from '@/features/ai-assistant/hooks/use-ai-chat';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { AiMessageList } from '@/features/ai-assistant/components/ai-message';
import { AiComposer } from '@/features/ai-assistant/components/ai-composer';

export function CustomErrorExample() {
  const runtime = useAiChat();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className='flex h-[600px] flex-col rounded-lg border'>
        <AiMessageList />
        <AiComposer />
      </div>
    </AssistantRuntimeProvider>
  );
}

// ============================================
// Example 4: Floating Chat Button - زر عائم
// ============================================

import { useState } from 'react';
import { X } from 'lucide-react';

export function FloatingChatExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className='fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg transition-transform hover:scale-110'
          dir='rtl'
        >
          <MessageSquare className='h-6 w-6' />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className='fixed bottom-6 left-6 z-50 w-96 rounded-lg shadow-2xl'>
          <div className='relative'>
            <button
              onClick={() => setIsOpen(false)}
              className='absolute -top-2 -left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white'
            >
              <X className='h-4 w-4' />
            </button>
            <AiChatbot />
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// Example 5: Sidebar Chat - محادثة جانبية
// ============================================

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function SidebarChatExample() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <MessageSquare className='h-4 w-4' />
          المساعد الذكي
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-full sm:max-w-2xl'>
        <div className='h-full pt-6'>
          <AiChatbot />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================
// Example 6: Full Page Chat - صفحة كاملة
// ============================================

export function FullPageChatExample() {
  return (
    <div className='flex h-screen flex-col'>
      {/* Header */}
      <header className='bg-background border-b px-6 py-4'>
        <h1 className='text-2xl font-bold' dir='rtl'>
          مساعد BDFM الذكي
        </h1>
      </header>

      {/* Chat Area */}
      <div className='flex-1 overflow-hidden p-6'>
        <div className='mx-auto h-full max-w-4xl'>
          <AiChatbot />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 7: Quick Access Popover
// ============================================

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

export function PopoverChatExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size='icon' variant='ghost'>
          <MessageSquare className='h-5 w-5' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-96 p-0' align='end'>
        <div className='h-[500px]'>
          <AiChatbot />
        </div>
      </PopoverContent>
    </Popover>
  );
}
