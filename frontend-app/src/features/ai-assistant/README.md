# AI Assistant Chatbot

مكون chatbot ذكي متكامل مع نظام RAG الخاص بـ BDFM Hub.

## المميزات

### ✨ الميزات الرئيسية

- **Streaming Responses**: دعم كامل للإجابات المباشرة (Real-time streaming)
- **Modern UI**: واجهة عصرية وجذابة باستخدام `@assistant-ui/react`
- **RTL Support**: دعم كامل للغة العربية (من اليمين لليسار)
- **AI SDK Integration**: تكامل سلس مع `@ai-sdk/react`
- **TypeScript**: مكتوب بالكامل بـ TypeScript للأمان من الأخطاء

## البنية

```
src/features/ai-assistant/
├── api/
│   └── ai-assistant.service.ts    # خدمات API للتواصل مع RAG system
├── components/
│   ├── ai-chatbot.tsx             # المكون الرئيسي للـ chatbot
│   ├── ai-message.tsx             # مكونات عرض الرسائل
│   ├── ai-composer.tsx            # مكون إدخال الرسائل
│   └── index.ts                   # تصدير المكونات
├── hooks/
│   └── use-ai-chat.ts             # Hook مخصص لإدارة الـ chat
└── types/
    └── index.ts                   # أنواع TypeScript

src/app/api/ai-assistant/
└── chat/
    └── route.ts                   # API Route للـ streaming
```

## الاستخدام

### في الصفحة

```tsx
import { AiChatbot } from '@/features/ai-assistant/components';

export default function Page() {
  return (
    <div className='container'>
      <AiChatbot />
    </div>
  );
}
```

### Hook مخصص

```tsx
import { useAiChat } from '@/features/ai-assistant/hooks/use-ai-chat';

export function MyComponent() {
  const runtime = useAiChat({
    onError: (error) => console.error(error)
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>...</AssistantRuntimeProvider>
  );
}
```

## المكونات

### `<AiChatbot />`

المكون الرئيسي الذي يحتوي على كل شيء - الرسائل، الإدخال، والتصميم.

**Props**: لا يوجد (self-contained)

**المميزات**:

- تصميم عصري مع gradients
- Header مخصص مع أيقونات
- Separator بين الأقسام
- ScrollArea للرسائل

### `<AiMessageList />`

يعرض قائمة الرسائل بين المستخدم والمساعد الذكي.

**المميزات**:

- رسائل المستخدم بخلفية فاتحة
- رسائل المساعد بخلفية ملونة
- أيقونات مميزة لكل نوع
- دعم الـ prose styling للمحتوى

### `<AiComposer />`

مكون إدخال الرسائل مع زر الإرسال.

**المميزات**:

- Textarea قابل للتوسع
- زر إرسال مع أيقونة
- دعم Enter للإرسال
- RTL support كامل

## API Route

### `POST /api/ai-assistant/chat`

**Request**:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "ما هي المراسلات الأخيرة؟"
    }
  ]
}
```

**Response**:

- Content-Type: `text/event-stream`
- Streaming text response

## التكامل مع RAG System

يتصل المكون بنظام RAG عبر endpoint:

- Base URL: `NEXT_PUBLIC_RAG_API_URL`
- Endpoint: `/query/stream`

**معلمات الطلب**:

```typescript
{
  query: string;
  language: 'ar' | 'en';
  maxResults: number;
  similarityThreshold: number;
}
```

## المتطلبات

### المكتبات المثبتة:

- `@assistant-ui/react` - ^0.11.35
- `@assistant-ui/react-ai-sdk` - ^1.1.8
- `@ai-sdk/react` - ^2.0.82
- `ai` - ^5.0.82

### متغيرات البيئة:

```env
NEXT_PUBLIC_RAG_API_URL=http://localhost:3001/api/rag
```

## التخصيص

### تخصيص الألوان

في `ai-chatbot.tsx`:

```tsx
// Header gradient
className = 'bg-gradient-to-r from-purple-500 to-blue-600';

// Assistant icon gradient
className = 'bg-gradient-to-br from-purple-500 to-blue-600';
```

### تخصيص الرسائل

في `ai-message.tsx` يمكنك تعديل:

- أيقونات الرسائل
- الخلفيات
- التنسيق
- الأنماط

### إضافة ميزات

يمكنك إضافة:

- Voice input
- File attachments
- Source citations
- Copy to clipboard
- Message reactions

## الأمثلة

### مثال بسيط

```tsx
<AiChatbot />
```

### مثال مع Container

```tsx
<div className='container mx-auto max-w-4xl py-10'>
  <AiChatbot />
</div>
```

### مثال في Modal

```tsx
<Dialog>
  <DialogContent className='max-w-4xl'>
    <AiChatbot />
  </DialogContent>
</Dialog>
```

## الأداء

- **Edge Runtime**: يستخدم Edge runtime للسرعة
- **Streaming**: يبدأ عرض النتائج فوراً
- **Memoization**: المكونات محسنة لتجنب Re-renders غير ضرورية

## الاختبار

للاختبار المحلي:

1. شغل RAG system على `localhost:3001`
2. شغل Next.js: `npm run dev`
3. افتح `/ai-assistant` في المتصفح
4. جرب طرح سؤال

## المشاكل الشائعة

### الـ streaming لا يعمل

- تأكد من أن RAG system يعمل
- تحقق من `NEXT_PUBLIC_RAG_API_URL`
- افحص console للأخطاء

### الرسائل لا تظهر

- تحقق من أن المكونات مستوردة بشكل صحيح
- افحص الـ runtime provider

### الأخطاء في TypeScript

- تأكد من تثبيت جميع المكتبات
- شغل `npm install`

## المراجع

- [assistant-ui Documentation](https://www.assistant-ui.com)
- [AI SDK Documentation](https://sdk.vercel.ai)
- [BDFM RAG System](../api/ai-assistant.service.ts)

## المطورون

تم التطوير بواسطة فريق BDFM Hub

## الترخيص

خاص بمشروع BDFM Hub
