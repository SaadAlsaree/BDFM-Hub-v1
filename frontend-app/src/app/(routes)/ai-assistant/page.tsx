'use client';

import PageContainer from '@/components/layout/page-container';
import { AiChatbot } from '@/features/ai-assistant/components/ai-chatbot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, MessageSquare, Zap, Shield } from 'lucide-react';

const AiAssistantPage = () => {
  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header Section */}
        <div className='text-center' dir='rtl'>
          <div className='mb-4 flex justify-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600'>
              <Sparkles className='h-8 w-8 text-white' />
            </div>
          </div>
          <h1 className='text-3xl font-bold'>مساعد BDFM الذكي</h1>
          <p className='text-muted-foreground mt-2'>
            استخدم الذكاء الاصطناعي للبحث في المراسلات والمعاملات
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid gap-4 md:grid-cols-3' dir='rtl'>
          <Card>
            <CardHeader className='flex flex-row items-center space-x-2 space-x-reverse pb-2'>
              <MessageSquare className='h-4 w-4 text-purple-500' />
              <CardTitle className='text-sm font-medium'>
                استعلامات ذكية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm'>
                اطرح أسئلتك بلغة طبيعية واحصل على إجابات دقيقة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center space-x-2 space-x-reverse pb-2'>
              <Zap className='h-4 w-4 text-blue-500' />
              <CardTitle className='text-sm font-medium'>بث مباشر</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm'>
                احصل على الإجابات فوراً مع تقنية البث المباشر
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center space-x-2 space-x-reverse pb-2'>
              <Shield className='h-4 w-4 text-green-500' />
              <CardTitle className='text-sm font-medium'>آمن وموثوق</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm'>
                بيانات محمية مع الحفاظ على السرية والأمان
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chatbot Section */}
        <div className='flex items-center justify-center'>
          <AiChatbot />
        </div>

        {/* Tips Section */}
        <Card className='border-dashed' dir='rtl'>
          <CardHeader>
            <CardTitle className='text-sm'>💡 نصائح للاستخدام الأمثل</CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-2 text-sm'>
            <p>• اطرح أسئلة محددة للحصول على إجابات أكثر دقة</p>
            <p>• يمكنك السؤال عن المعاملات، المراسلات، أو الإحصائيات</p>
            <p>• استخدم كلمات مفتاحية واضحة للبحث الأفضل</p>
            <p>• المساعد يدعم اللغتين العربية والإنجليزية</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AiAssistantPage;
