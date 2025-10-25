# BDFM RAG System

نظام RAG (Retrieval-Augmented Generation) متطور لنظام BDFM.Hub يوفر إمكانيات الذكاء الاصطناعي للاستعلام عن المراسلات وخطوات العمل.

## المميزات

### 1. الاستعلام الذكي عن المراسلات
- البحث الدلالي (Semantic Search) باستخدام embeddings
- إجابات ذكية باستخدام RAG مع المصادر
- دعم اللغة العربية والإنجليزية
- استرجاع المراسلات المشابهة بناءً على المحتوى

### 2. المزامنة التلقائية
- مزامنة البيانات من PostgreSQL إلى Qdrant
- معالجة دفعية للمراسلات
- تحديث تلقائي عند إضافة مراسلات جديدة
- دعم المزامنة الجزئية والكاملة

### 3. دليل الاستخدام التفاعلي
- قاعدة معرفية عن نظام BDFM
- إجابات تلقائية على الأسئلة الشائعة
- مرجع شامل لاستخدام النظام

## التقنيات المستخدمة

- **Node.js + TypeScript**: البيئة الأساسية
- **Qdrant**: قاعدة بيانات vectors عالية الأداء
- **Ollama**:
  - `qwen2.5:3b`: لتوليد embeddings
  - `gpt-oss:20b`: لتوليد الإجابات الذكية
- **PostgreSQL**: قاعدة البيانات الأساسية لـ BDFM
- **Express**: Web framework

## التثبيت

### المتطلبات الأساسية

1. **Node.js** (v18 أو أحدث)
2. **Qdrant** (v1.7.0 أو أحدث)
3. **Ollama** مع النماذج المطلوبة
4. **PostgreSQL** (نظام BDFM الأساسي)

### تثبيت Qdrant

#### باستخدام Docker
```bash
docker run -d -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

#### باستخدام Docker Compose
```yaml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage:/qdrant/storage
    restart: unless-stopped
```

### تثبيت Ollama والنماذج

```bash
# تثبيت Ollama (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# تحميل النماذج المطلوبة
ollama pull qwen2.5:3b
ollama pull gpt-oss:20b
```

### إعداد المشروع

```bash
# استنساخ المشروع
cd BDFM-RAG-System

# تثبيت المكتبات
npm install

# إنشاء ملف .env
cp .env.example .env

# تعديل ملف .env بالإعدادات الخاصة بك
nano .env
```

## الاستخدام

### تشغيل الخادم

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build
npm start
```

### المزامنة الأولية

```bash
# مزامنة جميع المراسلات
npm run sync
```

## API Endpoints

### 1. الاستعلام عن المراسلات

**POST** `/api/rag/query`

```json
{
  "query": "ما هي المراسلات الخاصة بموضوع الموارد البشرية؟",
  "language": "ar",
  "maxResults": 10,
  "similarityThreshold": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "وجدت عدة مراسلات متعلقة بالموارد البشرية...",
    "sources": [
      {
        "id": "uuid",
        "mailNum": "500-2025",
        "subject": "طلب توظيف",
        "bodyText": "...",
        "similarityScore": 0.92,
        "mailDate": "2025-01-15"
      }
    ],
    "language": "ar"
  }
}
```

### 2. المزامنة

**POST** `/api/rag/sync`

```json
{
  "type": "full",
  "batchSize": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": 1250,
    "failed": 0,
    "duration": "45s"
  }
}
```

### 3. فهرسة مراسلة واحدة

**POST** `/api/rag/index`

```json
{
  "correspondenceId": "uuid-here"
}
```

### 4. حالة النظام

**GET** `/api/rag/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "qdrant": {
      "connected": true,
      "collections": {
        "correspondences": 1250,
        "workflows": 3450,
        "userGuide": 150
      }
    },
    "ollama": {
      "connected": true,
      "models": ["qwen2.5:3b", "gpt-oss:20b"]
    },
    "postgres": {
      "connected": true
    }
  }
}
```

### 5. البحث عن مراسلات مشابهة

**POST** `/api/rag/search`

```json
{
  "text": "النص المراد البحث عنه",
  "maxResults": 5,
  "threshold": 0.8
}
```

## البنية المعمارية

```
BDFM-RAG-System/
├── src/
│   ├── config/           # إعدادات النظام
│   ├── services/         # الخدمات الأساسية
│   │   ├── qdrant.service.ts
│   │   ├── embedding.service.ts
│   │   ├── llm.service.ts
│   │   ├── sync.service.ts
│   │   └── rag.service.ts
│   ├── controllers/      # API Controllers
│   ├── models/          # TypeScript interfaces/types
│   ├── utils/           # وظائف مساعدة
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   └── index.ts         # نقطة الدخول
├── docs/                # الوثائق
├── scripts/             # Scripts للصيانة
├── logs/                # Log files
└── tests/               # Unit & Integration tests
```

## الإعدادات المتقدمة

### تحسين الأداء

```env
# زيادة حجم الدفعات للمزامنة الأسرع
SYNC_BATCH_SIZE=200

# تقليل Timeout لـ Ollama
OLLAMA_TIMEOUT=60000

# ضبط عدد النتائج
MAX_RESULTS=20
```

### ضبط جودة النتائج

```env
# رفع عتبة التشابه لنتائج أكثر دقة
SIMILARITY_THRESHOLD=0.85

# تقليل حجم القطع للدقة الأعلى
CHUNK_SIZE=300
CHUNK_OVERLAP=30
```

## المراقبة والصيانة

### عرض السجلات

```bash
tail -f logs/bdfm-rag.log
```

### إعادة بناء الفهرس

```bash
# حذف البيانات الحالية وإعادة المزامنة
npm run sync -- --rebuild
```

### النسخ الاحتياطي

```bash
# نسخ احتياطي لـ Qdrant storage
tar -czf qdrant_backup_$(date +%Y%m%d).tar.gz qdrant_storage/
```

## الأمان

- جميع الاتصالات مشفرة (HTTPS في الإنتاج)
- التحقق من صحة المدخلات باستخدام Zod
- حماية من SQL Injection
- Rate limiting على API endpoints
- التحقق من الصلاحيات (Integration مع BDFM Auth)

## الأداء

- **البحث**: < 100ms للاستعلامات البسيطة
- **التوليد**: 2-5 ثواني (حسب حجم السياق)
- **المزامنة**: ~100 مراسلة/ثانية
- **الذاكرة**: ~500MB أثناء التشغيل العادي

## الدعم الفني

للحصول على الدعم:
1. راجع الوثائق في مجلد `/docs`
2. افتح issue على GitHub
3. تواصل مع فريق BDFM

## الترخيص

MIT License - انظر ملف LICENSE للتفاصيل.

## المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch للميزة الجديدة
3. Commit التغييرات
4. Push إلى Branch
5. فتح Pull Request

---

**تم التطوير بواسطة**: فريق BDFM
**الإصدار**: 1.0.0
**التاريخ**: 2025-01-23
