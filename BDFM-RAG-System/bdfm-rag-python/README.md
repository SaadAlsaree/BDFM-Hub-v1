# BDFM RAG System - Python Version

نظام RAG (Retrieval-Augmented Generation) متطور مبني بـ Python مع FastAPI، Whisper، و multilingual-e5-large.

## المميزات الرئيسية

### ✨ الجديد في Python Version

1. **تكامل مباشر مع Whisper**

   -  نسخ صوتي محلي بدون الحاجة لخدمات خارجية
   -  دعم ممتاز للغة العربية
   -  استخدام `faster-whisper` للأداء الأمثل

2. **Embeddings عالية الجودة للعربية**

   -  استخدام `intfloat/multilingual-e5-large`
   -  Dimension: 1024 (أفضل من nomic-embed)
   -  دعم استثنائي للغة العربية

3. **مزامنة تلقائية متقدمة**
   -  PostgreSQL Triggers + NOTIFY/LISTEN للوقت الفعلي
   -  Scheduled Tasks للنسخ الاحتياطي
   -  Hybrid approach للموثوقية القصوى

## المتطلبات الأساسية

-  Python 3.11+
-  Conda (مفضل) أو pip
-  PostgreSQL
-  Qdrant
-  Ollama (للـ LLM فقط)
-  CUDA (اختياري للـ GPU acceleration)

## التثبيت

### 1. إنشاء البيئة

#### استخدام Conda (موصى به):

```bash
# إنشاء البيئة
conda env create -f environment.yml

# تفعيل البيئة
conda activate bdfm-rag
```

#### أو استخدام pip:

```bash
# إنشاء virtual environment
python -m venv venv

# تفعيل (Windows)
venv\Scripts\activate

# تفعيل (Linux/Mac)
source venv/bin/activate

# تثبيت المكتبات
pip install -r requirements.txt
```

### 2. إعداد ملف .env

```bash
# نسخ ملف المثال
cp .env.example .env

# تعديل الإعدادات
# (فتح .env وتعديل حسب بيئتك)
```

### 3. تشغيل Qdrant

```bash
docker run -d -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

### 4. تشغيل التطبيق

```bash
# Development mode
uvicorn app.main:app --reload --port 3001

# أو
python -m uvicorn app.main:app --reload --port 3001
```

## البنية المعمارية

```
bdfm-rag-python/
├── app/
│   ├── config.py              # الإعدادات
│   ├── main.py                # FastAPI application
│   ├── models/                # Pydantic models
│   ├── api/                   # API routes
│   │   ├── rag.py
│   │   ├── conversations.py
│   │   ├── speech.py
│   │   └── statistics.py
│   ├── services/              # Business logic
│   │   ├── embedding_service.py       # multilingual-e5-large
│   │   ├── qdrant_service.py          # Vector DB
│   │   ├── llm_service.py             # Ollama integration
│   │   ├── rag_service.py             # RAG pipeline
│   │   ├── speech_service.py          # Whisper integration ⭐
│   │   ├── sync_service.py            # Auto-sync
│   │   ├── conversation_service.py
│   │   └── statistics_service.py
│   ├── database/              # PostgreSQL
│   │   └── postgres.py
│   └── utils/                 # Utilities
│       ├── logger.py
│       └── helpers.py
├── tests/                     # Tests
├── scripts/                   # CLI scripts
└── logs/                      # Log files
```

## API Endpoints

### RAG Endpoints

-  `POST /api/rag/query` - RAG query
-  `POST /api/rag/query/stream` - Streaming query
-  `POST /api/rag/search` - Search only
-  `POST /api/rag/sync` - Sync correspondences
-  `POST /api/rag/index` - Index single correspondence
-  `GET /api/rag/status` - System status

### Speech-to-Text Endpoints

-  `POST /api/rag/speech/transcribe` - نسخ ملف صوتي
-  `POST /api/rag/speech/transcribe-url` - نسخ من URL
-  `POST /api/rag/speech/voice-message` - رسالة صوتية مع RAG
-  `POST /api/rag/speech/detect-language` - كشف اللغة

### Conversation Endpoints

-  `POST /api/rag/conversations` - إنشاء محادثة
-  `GET /api/rag/conversations` - قائمة المحادثات
-  `POST /api/rag/conversations/message` - إرسال رسالة

### Statistics Endpoints

-  `GET /api/rag/statistics/correspondences/overview`
-  `GET /api/rag/statistics/workflow/overview`
-  `GET /api/rag/statistics/reports/performance`

## المزامنة التلقائية

النظام يدعم مزامنة تلقائية بطريقتين:

1. **PostgreSQL Triggers (Real-time)**

   -  يستمع للتغييرات في الوقت الفعلي
   -  مزامنة فورية عند إضافة/تعديل/حذف مراسلة

2. **Scheduled Tasks (Backup)**
   -  مزامنة تزايدية كل 5 دقائق
   -  مزامنة كاملة يومياً

## أمثلة الاستخدام

### Python

```python
import requests

# RAG Query
response = requests.post(
    "http://localhost:3001/api/rag/query",
    json={
        "query": "ما هي المراسلات المتعلقة بالموارد البشرية؟",
        "language": "ar",
        "max_results": 5
    }
)
print(response.json())

# Speech-to-Text
with open("audio.mp3", "rb") as f:
    response = requests.post(
        "http://localhost:3001/api/rag/speech/transcribe",
        files={"file": f},
        data={"language": "ar"}
    )
print(response.json())
```

### cURL

```bash
# RAG Query
curl -X POST http://localhost:3001/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "المراسلات المتعلقة بالتوظيف", "language": "ar"}'

# Transcribe Audio
curl -X POST http://localhost:3001/api/rag/speech/transcribe \
  -F "file=@audio.mp3" \
  -F "language=ar"
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_embedding_service.py
```

## الأداء

-  **البحث الدلالي:** < 100ms
-  **توليد الإجابة:** 2-5 ثوانٍ
-  **نسخ الصوت:** يعتمد على طول الملف (~1x realtime)
-  **المزامنة:** ~100 مراسلة/ثانية

## المقارنة مع النسخة القديمة (Node.js)

| الميزة             | Node.js Version    | Python Version            |
| ------------------ | ------------------ | ------------------------- |
| Speech-to-Text     | ❌ يحتاج API خارجي | ✅ مدمج مع Whisper        |
| Embeddings للعربية | ⚠️ متوسط (nomic)   | ✅ ممتاز (e5-large)       |
| Auto-sync          | ❌ يدوي            | ✅ تلقائي (triggers)      |
| Fine-tuning        | ❌ صعب             | ✅ سهل (Python ecosystem) |
| AI/ML Tools        | ⚠️ محدود           | ✅ غني                    |

## الترخيص

MIT License

## المساهمة

نرحب بالمساهمات! راجع [CONTRIBUTING.md](CONTRIBUTING.md) للتفاصيل.

## الدعم

للمشاكل والأسئلة، افتح issue على GitHub أو تواصل مع فريق BDFM.

---

**تم التطوير بواسطة:** فريق BDFM  
**الإصدار:** 2.0.0  
**التاريخ:** 2025-01-29
