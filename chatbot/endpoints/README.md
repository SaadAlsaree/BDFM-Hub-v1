# API Endpoints Testing Files

هذا المجلد يحتوي على ملفات HTTP requests لاختبار جميع الـ API endpoints.

## المتطلبات

- VS Code مع [REST Client Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- أو أي أداة أخرى تدعم HTTP request files

## الملفات

- **auth.http** - Authentication endpoints (تسجيل، دخول، خروج)
- **ollama.http** - Ollama endpoints (جلب الموديلات)
- **conversations.http** - Conversation endpoints (CRUD operations)
- **messages.http** - Message endpoints (إرسال رسائل، جلب رسائل)
- **attachments.http** - Attachment endpoints (جلب المرفقات)
- **health.http** - Health check endpoint

## كيفية الاستخدام

### 1. إعداد المتغيرات

في كل ملف، قم بتحديث المتغيرات في الأعلى:

```http
@baseUrl = http://localhost:5000
@token = your-jwt-token-here
@conversationId = your-conversation-id-here
```

### 2. الحصول على Token

1. افتح `auth.http`
2. قم بتشغيل request `Register` أو `Login`
3. انسخ الـ `token` من الـ response
4. الصقه في متغير `@token` في جميع الملفات

### 3. الحصول على Conversation ID

1. افتح `conversations.http`
2. قم بتشغيل request `Create Conversation`
3. انسخ الـ `_id` من الـ response
4. الصقه في متغير `@conversationId` في الملفات المطلوبة

### 4. تشغيل Requests

في VS Code مع REST Client:
- اضغط على `Send Request` فوق كل request
- أو استخدم `Ctrl+Alt+R` (Windows/Linux) أو `Cmd+Alt+R` (Mac)

## أمثلة على الاستخدام

### مثال 1: تسجيل مستخدم جديد وإرسال رسالة

1. **تسجيل مستخدم جديد:**
   - افتح `auth.http`
   - شغّل `Register`
   - انسخ الـ `token`

2. **إنشاء محادثة:**
   - افتح `conversations.http`
   - حدّث `@token` بالـ token الذي حصلت عليه
   - شغّل `Create Conversation`
   - انسخ الـ `_id`

3. **إرسال رسالة:**
   - افتح `messages.http`
   - حدّث `@token` و `@conversationId`
   - شغّل `Send Message`

### مثال 2: إرسال رسالة مع صورة

1. تأكد من وجود ملف صورة في مجلد المشروع
2. افتح `messages.http`
3. حدّث `@token` و `@conversationId`
4. في request `Send Message with Image`، غيّر المسار:
   ```
   < ./path/to/your/image.jpg
   ```
   إلى المسار الفعلي لصورتك
5. شغّل الـ request

## ملاحظات مهمة

- **Token**: جميع الـ endpoints (عدا register/login) تحتاج token
- **Conversation ID**: مطلوب لجميع requests المتعلقة بالرسائل والمرفقات
- **File Paths**: عند إرسال ملفات، تأكد من أن المسار صحيح نسبيًا من جذر المشروع
- **Content-Type**: عند إرسال ملفات، استخدم `multipart/form-data`

## استكشاف الأخطاء

### خطأ 401 (Unauthorized)
- تأكد من تحديث `@token` في الملف
- تأكد من أن الـ token لم ينتهِ صلاحيته

### خطأ 404 (Not Found)
- تأكد من تحديث `@conversationId` بشكل صحيح
- تأكد من أن المحادثة موجودة وتنتمي للمستخدم

### خطأ 503 (Service Unavailable)
- تأكد من تشغيل Ollama على `http://localhost:11434`
- تحقق من `OLLAMA_BASE_URL` في `.env`

## نصائح

- استخدم متغيرات VS Code REST Client لحفظ الـ token تلقائيًا
- يمكنك إنشاء ملف `variables.http` مشترك لجميع الملفات
- استخدم `# @name` لتسمية requests وحفظ الـ responses

