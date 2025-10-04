# نظام الذكاء الاصطناعي وقاعدة البيانات المتجهية

## نظرة عامة

تم بناء نظام ذكاء اصطناعي متكامل باستخدام Ollama لإنشاء قاعدة بيانات متجهية (Vector Database) للمساعدة في التفاعل الذكي مع التطبيق. النظام يدعم البحث في المرفقات والمراسلات باللغة العربية ويوفر خوارزميات تشابه محسنة.

## المكونات الرئيسية

### 1. كيانات الذكاء الاصطناعي (AI Entities)

#### VectorDocument

-  **الغرض**: تخزين المستندات المحولة إلى vectors
-  **الحقول الرئيسية**:
   -  `Content`: محتوى المستند
   -  `Embedding`: المتجه الرقمي للمحتوى
   -  `SourceType`: نوع المصدر (Correspondence, Attachment, Comment)
   -  `SourceId`: معرف المصدر
   -  `Language`: اللغة (افتراضي: العربية)
   -  `IsProcessed`: حالة المعالجة

#### AIConversation

-  **الغرض**: تتبع المحادثات مع المساعد الذكي
-  **الحقول الرئيسية**:
   -  `UserId`: معرف المستخدم
   -  `SessionId`: معرف الجلسة
   -  `Title`: عنوان المحادثة
   -  `Status`: حالة المحادثة (نشط، معلق، مكتمل، ملغي)

#### AIMessage

-  **الغرض**: تخزين رسائل المحادثة
-  **الحقول الرئيسية**:
   -  `ConversationId`: معرف المحادثة
   -  `MessageType`: نوع الرسالة (سؤال، إجابة، بحث، تحليل)
   -  `Content`: محتوى الرسالة
   -  `ResponseContent`: محتوى الرد
   -  `TokenCount`: عدد الرموز المميزة
   -  `ProcessingTime`: وقت المعالجة

### 2. الخدمات (Services)

#### IOllamaService

-  **الوظائف**:
   -  `GenerateEmbeddingAsync`: إنشاء متجهات للمحتوى
   -  `GenerateChatResponseAsync`: إنشاء ردود المحادثة
   -  `GenerateResponseWithContextAsync`: إنشاء ردود مع سياق
   -  `IsModelAvailableAsync`: التحقق من توفر النماذج

#### IVectorDatabaseService

-  **الوظائف**:
   -  `IndexDocumentAsync`: فهرسة مستند
   -  `SearchSimilarAsync`: البحث عن مستندات مشابهة
   -  `SearchByContentAsync`: البحث في المحتوى
   -  `GetDocumentsBySourceAsync`: الحصول على مستندات حسب المصدر

#### IAIAssistantService

-  **الوظائف**:
   -  `CreateConversationAsync`: إنشاء محادثة جديدة
   -  `SendMessageAsync`: إرسال رسالة
   -  `SearchAndAnswerAsync`: البحث والإجابة
   -  `AnalyzeCorrespondenceAsync`: تحليل المراسلات
   -  `SummarizeDocumentsAsync`: تلخيص المستندات

### 3. نماذج Ollama المدعومة

#### نموذج التضمين (Embedding Model)

-  **النموذج**: `all-minilm`
-  **الغرض**: تحويل النصوص إلى متجهات رقمية
-  **المميزات**:
   -  دعم اللغة العربية
   -  دقة عالية في التضمين
   -  سرعة في المعالجة

#### نموذج المحادثة (Chat Model)

-  **النموذج**: `deepseek-r1:8b`
-  **الغرض**: إنشاء ردود ذكية
-  **المميزات**:
   -  فهم عميق للغة العربية
   -  قدرة على التحليل والتلخيص
   -  دعم السياق والمحادثات

## الإعداد والتكوين

### 1. تثبيت Ollama

```bash
# تثبيت Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# تشغيل خدمة Ollama
ollama serve

# تحميل النماذج المطلوبة
ollama pull all-minilm
ollama pull deepseek-r1:8b
```

### 2. إعداد قاعدة البيانات

```sql
-- إنشاء جدول VectorDocuments
CREATE TABLE "VectorDocuments" (
    "Id" uuid PRIMARY KEY,
    "Content" text NOT NULL,
    "ContentHash" text NOT NULL,
    "Embedding" real[] NOT NULL,
    "SourceType" text NOT NULL,
    "SourceId" uuid NOT NULL,
    "SourceTitle" text NOT NULL,
    "Language" text DEFAULT 'ar',
    "DocumentType" integer NOT NULL,
    "Metadata" text,
    "IsProcessed" boolean DEFAULT false,
    "ProcessedAt" timestamp with time zone,
    "ProcessingError" text,
    "CreateAt" timestamp with time zone NOT NULL,
    "CreateBy" uuid,
    "LastUpdateAt" timestamp with time zone,
    "LastUpdateBy" uuid,
    "StatusId" integer NOT NULL,
    "IsDeleted" boolean DEFAULT false,
    "DeletedAt" timestamp with time zone,
    "DoneProcdureDate" timestamp with time zone
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX "IX_VectorDocuments_SourceType_SourceId" ON "VectorDocuments" ("SourceType", "SourceId");
CREATE INDEX "IX_VectorDocuments_IsProcessed" ON "VectorDocuments" ("IsProcessed");
CREATE INDEX "IX_VectorDocuments_ContentHash" ON "VectorDocuments" ("ContentHash");
```

### 3. تكوين التطبيق

```json
{
   "Ollama": {
      "BaseUrl": "http://localhost:11434",
      "EmbeddingModel": "all-minilm",
      "ChatModel": "deepseek-r1:8b",
      "DefaultTemperature": 0.7,
      "MaxTokens": 4096,
      "MaxRetries": 3,
      "Timeout": "00:02:00"
   }
}
```

## API Endpoints

### 1. إنشاء محادثة جديدة

```http
POST /BDFM/v1/api/AI/CreateConversation
Content-Type: application/json

{
  "userId": "guid",
  "title": "عنوان المحادثة"
}
```

### 2. إرسال رسالة

```http
POST /BDFM/v1/api/AI/SendMessage
Content-Type: application/json

{
  "conversationId": "guid",
  "message": "رسالتك هنا",
  "userId": "guid"
}
```

### 3. البحث في المستندات

```http
GET /BDFM/v1/api/AI/SearchDocuments?query=استعلام البحث&limit=10
```

### 4. البحث والإجابة

```http
GET /BDFM/v1/api/AI/SearchAndAnswer?query=سؤالك هنا&userId=guid
```

### 5. تحليل الكتاب

```http
GET /BDFM/v1/api/AI/AnalyzeCorrespondence?correspondenceId=guid&analysisType=summary&userId=guid
```

## أنواع التحليل المدعومة

### 1. التلخيص (summary)

-  تلخيص الكتاب بشكل مختصر ومفيد
-  استخراج النقاط الرئيسية

### 2. الكلمات المفتاحية (keywords)

-  استخراج الكلمات المهمة
-  تحديد المواضيع الرئيسية

### 3. تحليل المشاعر (sentiment)

-  تحليل التوجه العام للمراسلة
-  تحديد المشاعر والتقييم

### 4. العناصر المطلوبة (action_items)

-  تحديد العناصر التي تتطلب إجراءات
-  قائمة المهام والمتابعات

## المميزات المتقدمة

### 1. دعم اللغة العربية

-  معالجة النصوص العربية
-  فهم السياق الثقافي
-  دعم اللهجات المختلفة

### 2. البحث في المرفقات

-  دعم ملفات PDF و Word
-  استخراج النصوص من الصور (OCR)
-  فهرسة المحتوى تلقائياً

### 3. خوارزميات التشابه المحسنة

-  حساب تشابه جيب التمام (Cosine Similarity)
-  عتبات قابلة للتخصيص
-  ترتيب النتائج حسب الأهمية

### 4. البحث في المراسلات المرتبطة

-  ربط المراسلات المتشابهة
-  البحث في السياق التاريخي
-  تحليل العلاقات بين المراسلات

## الأمان والخصوصية

### 1. تشفير البيانات

-  تشفير المتجهات المخزنة
-  حماية المحتوى الحساس
-  إدارة الصلاحيات

### 2. تتبع الاستخدام

-  تسجيل جميع العمليات
-  مراقبة الأداء
-  تحليل الأنماط

### 3. حماية الخصوصية

-  عدم تخزين البيانات الحساسة
-  حذف البيانات عند الطلب
-  إعدادات الخصوصية

## الأداء والتحسين

### 1. التخزين المؤقت

-  تخزين مؤقت للمتجهات
-  تحسين سرعة البحث
-  تقليل استهلاك الموارد

### 2. المعالجة المتوازية

-  معالجة متوازية للمستندات
-  تحسين وقت الاستجابة
-  إدارة الموارد بكفاءة

### 3. المراقبة والتحليل

-  مراقبة الأداء في الوقت الفعلي
-  تحليل أنماط الاستخدام
-  تحسين الخوارزميات

## استكشاف الأخطاء

### 1. مشاكل Ollama

```bash
# التحقق من حالة الخدمة
ollama list

# إعادة تشغيل الخدمة
sudo systemctl restart ollama

# فحص السجلات
journalctl -u ollama -f
```

### 2. مشاكل قاعدة البيانات

```sql
-- فحص حجم الجداول
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public';

-- تنظيف البيانات المحذوفة
DELETE FROM "VectorDocuments" WHERE "IsDeleted" = true;
```

### 3. مشاكل الأداء

-  مراقبة استخدام الذاكرة
-  تحسين استعلامات قاعدة البيانات
-  ضبط معاملات البحث

## التطوير المستقبلي

### 1. تحسينات مقترحة

-  دعم المزيد من اللغات
-  تحسين دقة البحث
-  إضافة ميزات تحليل متقدمة

### 2. التكامل مع أنظمة أخرى

-  تكامل مع أنظمة إدارة المحتوى
-  دعم المزيد من أنواع الملفات
-  ربط مع أنظمة الذكاء الاصطناعي الخارجية

### 3. التحسينات التقنية

-  استخدام تقنيات الذكاء الاصطناعي المتقدمة
-  تحسين خوارزميات التعلم الآلي
-  تطوير واجهات مستخدم محسنة

## الدعم والمساعدة

للمساعدة والدعم التقني، يرجى التواصل مع فريق التطوير أو مراجعة الوثائق التقنية المتاحة.
