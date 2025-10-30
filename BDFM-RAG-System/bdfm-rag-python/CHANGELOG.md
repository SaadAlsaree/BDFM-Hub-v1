# Changelog

جميع التغييرات المهمة لهذا المشروع سيتم توثيقها في هذا الملف.

## [2.0.0] - 2025-01-29

### ✨ ميزات جديدة

#### 1. التكامل المباشر مع Whisper ⭐

-  نسخ صوتي محلي بدون الحاجة لخدمات خارجية
-  دعم ممتاز للغة العربية
-  استخدام `faster-whisper` للأداء الأمثل
-  كشف تلقائي للغة
-  API endpoints:
   -  `POST /api/rag/speech/transcribe` - نسخ ملف صوتي
   -  `POST /api/rag/speech/transcribe-url` - نسخ من URL
   -  `POST /api/rag/speech/detect-language` - كشف اللغة

#### 2. Embeddings عالية الجودة للعربية

-  استخدام `intfloat/multilingual-e5-large`
-  Dimension: 1024 (أكبر من nomic-embed: 768)
-  دقة أعلى في البحث الدلالي للعربية
-  تحسين نتائج الـ RAG

#### 3. المزامنة التلقائية

-  PostgreSQL Triggers للوقت الفعلي
-  Scheduled Tasks للنسخ الاحتياطي
-  Hybrid approach للموثوقية القصوى
-  Endpoints جديدة:
   -  `GET /api/rag/sync/stats` - إحصائيات المزامنة

#### 4. FastAPI Framework

-  أداء أفضل من Express
-  Swagger UI تلقائي: `/docs`
-  Type safety مع Pydantic
-  Async/await native support

#### 5. Streaming Support

-  Streaming response للإجابات الطويلة
-  تجربة مستخدم أفضل
-  `POST /api/rag/query/stream`

### 🔧 تحسينات

-  **الأداء**

   -  Async operations في كل مكان
   -  Connection pooling محسّن
   -  Batch processing للـ embeddings
   -  Lazy loading للنماذج الكبيرة

-  **الكود**

   -  Type hints شامل
   -  Error handling محسّن
   -  Logging مفصّل مع `loguru`
   -  Code organization أفضل

-  **البنية التحتية**
   -  Conda support للـ AI/ML
   -  Environment management أفضل
   -  Configuration management مع Pydantic

### 📝 التوثيق

-  `README.md` - نظرة عامة شاملة
-  `INSTALL.md` - دليل التثبيت خطوة بخطوة
-  `USAGE.md` - أمثلة استخدام مفصّلة
-  `MIGRATION.md` - دليل الانتقال من Node.js
-  API Documentation تلقائي مع Swagger

### ⚠️ Breaking Changes

#### تغييرات API (متوافقة بشكل عام)

معظم الـ endpoints متوافقة، لكن هناك تحسينات:

**Response Format:**

```javascript
// القديم (Node.js)
{
  success: true,
  data: {...}
}

// الجديد (Python) - نفسه!
{
  success: true,
  data: {...},
  timestamp: "1234567890"  // إضافة
}
```

**Embedding Model:**

-  القديم: `nomic-embed-text` (dimension: 768)
-  الجديد: `multilingual-e5-large` (dimension: 1024)
-  **النتائج قد تكون مختلفة** (لكن أفضل للعربية!)

### 🔄 Migration Path

انظر [MIGRATION.md](MIGRATION.md) للتفاصيل.

**الخطوات السريعة:**

1. تثبيت Python environment
2. إعداد `.env`
3. تشغيل النظام الجديد
4. المزامنة الأولية: `POST /api/rag/sync`
5. اختبار ومقارنة
6. انتقال تدريجي

### 🐛 إصلاحات

-  تحسين معالجة الأخطاء
-  إصلاح memory leaks في embedding generation
-  تحسين connection handling لـ PostgreSQL
-  إصلاح Unicode handling للنصوص العربية

### 🎯 الأولويات في الإصدارات القادمة

#### v2.1.0 (قريباً)

-  [ ] Conversation support كامل
-  [ ] Statistics dashboard
-  [ ] User authentication
-  [ ] Rate limiting

#### v2.2.0

-  [ ] Multi-language support محسّن
-  [ ] Fine-tuned Whisper للهجات العربية
-  [ ] Caching ذكي
-  [ ] Query expansion

#### v3.0.0

-  [ ] Multi-modal RAG (صور + نصوص)
-  [ ] Graph RAG
-  [ ] Advanced analytics

---

## [1.0.0] - 2024-XX-XX (Node.js Version)

### المميزات الأصلية

-  RAG query أساسي
-  Qdrant integration
-  Ollama للـ embeddings و LLM
-  PostgreSQL integration
-  Conversation support
-  Statistics

### المشاكل في 1.0

-  ❌ Whisper عبر API خارجي
-  ⚠️ Embeddings متوسطة للعربية (nomic)
-  ❌ مزامنة يدوية فقط
-  ⚠️ محدود في AI/ML tools

---

## الإصدارات المستقبلية

تابع الـ [GitHub Releases](https://github.com/your-org/bdfm-rag/releases) للتحديثات.

## كيفية الترقية

```bash
# من v1.0 (Node.js) إلى v2.0 (Python)
# راجع MIGRATION.md
```

## الدعم

-  GitHub Issues: [رابط]
-  فريق BDFM التقني
-  Documentation: `/docs`
