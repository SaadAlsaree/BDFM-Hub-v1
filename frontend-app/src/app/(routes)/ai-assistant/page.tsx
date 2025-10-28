'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Heading } from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversationList } from '@/features/ai-assistant/components/conversation-list';
import { ChatWindow } from '@/features/ai-assistant/components/chat-window';
import { StatisticsOverview } from '@/features/ai-assistant/components/statistics-overview';
import AIAssistantService from '@/features/ai-assistant/api/ai-assistant.service';
import type { Conversation } from '@/features/ai-assistant/types';

// export const metadata = {
//   title: 'المساعد الذكي',
//   description: 'تحدث مع المساعد الذكي للحصول على معلومات عن الكتب والإحصائيات'
// };

export default function AIAssistantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState('chat');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Create new conversation
  const handleNewConversation = async () => {
    if (!session?.user?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const newConversation = await AIAssistantService.createConversation({
        userId: session.user.id,
        title: `محادثة جديدة - ${new Date().toLocaleDateString('ar-SA')}`,
        language: 'ar'
      });

      setCurrentConversation(newConversation);
      toast.success('تم إنشاء محادثة جديدة');
    } catch (error: any) {
      toast.error(error.message || 'فشل في إنشاء المحادثة');
    }
  };

  // Select conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  // Update conversation title
  const handleTitleChange = (title: string) => {
    if (currentConversation) {
      setCurrentConversation({
        ...currentConversation,
        title
      });
    }
  };

  // Delete current conversation
  const handleDeleteConversation = () => {
    setCurrentConversation(null);
  };

  if (status === 'loading') {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-muted-foreground'>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col'>
      {/* Page Header */}
      <div className='flex items-center justify-between border-b px-6 py-4'>
        <div>
          <Heading
            title='المساعد الذكي'
            description='(هذه النسخة تجريبية) تحدث مع المساعد الذكي للحصول على معلومات عن الكتب والإحصائيات'
          />
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-hidden'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='h-full'>
          <div className='bg-background border-b px-6'>
            <TabsList className='h-12'>
              <TabsTrigger value='chat' className='gap-2'>
                <span>المحادثة</span>
              </TabsTrigger>
              <TabsTrigger value='stats' className='gap-2'>
                <span>الإحصائيات</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='chat' className='m-0 h-[calc(100%-3rem)]'>
            <div className='grid h-full grid-cols-[320px_1fr]'>
              {/* Sidebar - Conversations List */}
              <ConversationList
                selectedId={currentConversation?.id}
                onSelect={handleSelectConversation}
                onNew={handleNewConversation}
              />

              {/* Main - Chat Window */}
              <ChatWindow
                conversation={currentConversation}
                onNewConversation={handleNewConversation}
                onTitleChange={handleTitleChange}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>
          </TabsContent>

          <TabsContent value='stats' className='m-0 h-[calc(100%-3rem)] p-6'>
            <div className='container mx-auto max-w-7xl'>
              <StatisticsOverview />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
