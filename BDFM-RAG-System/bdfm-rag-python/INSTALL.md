# دليل التثبيت - BDFM RAG System (Python Version)

## المتطلبات الأساسية

### 1. البرمجيات المطلوبة

-  Python 3.11 أو أحدث
-  Conda (مفضل) أو venv
-  PostgreSQL (قاعدة بيانات BDFM الموجودة)
-  Qdrant (vector database)
-  Ollama (للـ LLM generation)
-  CUDA (اختياري - لتسريع Whisper)

### 2. تحقق من التثبيتات

```bash
# Python
python --version  # يجب أن يكون >= 3.11

# Conda (إذا كنت تستخدمه)
conda --version

# Git
git --version
```

## خطوات التثبيت

### الخطوة 1: استنساخ المشروع

إذا لم يكن لديك المشروع بعد:

```bash
cd BDFM-Hub-v1/BDFM-RAG-System
```

### الخطوة 2: إنشاء البيئة

#### استخدام Conda (موصى به):

```bash
# الانتقال لمجلد المشروع
cd bdfm-rag-python

# إنشاء البيئة
conda env create -f environment.yml

# تفعيل البيئة
conda activate bdfm-rag
```

#### أو استخدام venv:

```bash
# الانتقال لمجلد المشروع
cd bdfm-rag-python

# إنشاء virtual environment
python -m venv venv

# تفعيل (Windows)
venv\Scripts\activate

# تفعيل (Linux/Mac)
source venv/bin/activate

# تثبيت المكتبات
pip install -r requirements.txt
```

### الخطوة 3: إعداد ملف .env

```bash
# نسخ ملف المثال
copy .env.example .env

# تعديل الإعدادات
notepad .env  # أو أي محرر نصوص
```

**إعدادات مهمة في .env:**

```env
# PostgreSQL (استخدم إعدادات BDFM الحالية)
POSTGRES_HOST=cm-db.inss.local
POSTGRES_PORT=5432
POSTGRES_DB=cmdb
POSTGRES_USER=cmuser
POSTGRES_PASSWORD=@DYKMk7xjB25

# Qdrant (محلي)
QDRANT_URL=http://localhost:6333

# Ollama (محلي)
OLLAMA_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=gpt-oss:20b

# Whisper
WHISPER_MODEL=large-v3
WHISPER_DEVICE=cuda  # أو cpu إذا لم يكن لديك GPU
```

### الخطوة 4: تشغيل Qdrant

#### استخدام Docker (موصى به):

```bash
# تشغيل Qdrant
docker run -d -p 6333:6333 -p 6334:6334 `
  -v ${PWD}/qdrant_storage:/qdrant/storage `
  --name bdfm-qdrant `
  qdrant/qdrant:latest
```

#### التحقق من Qdrant:

افتح المتصفح: http://localhost:6333/dashboard

### الخطوة 5: تشغيل Ollama

#### إذا لم يكن Ollama مثبتاً:

```bash
# Windows (استخدم installer من الموقع)
# https://ollama.com/download

# أو Linux
curl -fsSL https://ollama.com/install.sh | sh
```

#### تحميل النماذج المطلوبة:

```bash
# تحميل chat model
ollama pull gpt-oss:20b

# التحقق
ollama list
```

### الخطوة 6: إعداد PostgreSQL Triggers (اختياري للمزامنة التلقائية)

```bash
# تشغيل SQL script
psql -h cm-db.inss.local -U cmuser -d cmdb -f scripts/setup_pg_triggers.sql
```

### الخطوة 7: اختبار التثبيت

```bash
# تأكد من تفعيل البيئة
conda activate bdfm-rag  # أو: venv\Scripts\activate

# اختبار استيراد المكتبات
python -c "import fastapi; import sentence_transformers; import faster_whisper; print('OK')"
```

### الخطوة 8: تشغيل التطبيق

```bash
# Development mode
python run.py

# أو
uvicorn app.main:app --reload --port 3001
```

يجب أن ترى:

```
============================================================
  BDFM RAG System - Python Version 2.0.0
============================================================
  Environment: development
  Port: 3001
  Embedding Model: intfloat/multilingual-e5-large
  Whisper Model: large-v3
============================================================

INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:3001
```

### الخطوة 9: التحقق من النظام

افتح المتصفح: http://localhost:3001

يجب أن ترى صفحة معلومات API.

#### اختبار الـ API:

```bash
# Health check
curl http://localhost:3001/health

# Status check
curl http://localhost:3001/api/rag/status
```

### الخطوة 10: المزامنة الأولية

```bash
# في terminal جديد (مع تفعيل البيئة)
curl -X POST http://localhost:3001/api/rag/sync `
  -H "Content-Type: application/json" `
  -d '{\"type\": \"full\", \"batch_size\": 100}'
```

## استكشاف الأخطاء

### مشكلة: Whisper model لا يعمل

```bash
# تحميل النموذج يدوياً
python -c "import whisper; whisper.load_model('large-v3')"
```

### مشكلة: Embedding model بطيء جداً

```bash
# استخدم CPU بدلاً من CUDA إذا كانت هناك مشاكل
# في .env:
WHISPER_DEVICE=cpu
```

### مشكلة: PostgreSQL connection error

```bash
# تحقق من الاتصال
psql -h cm-db.inss.local -U cmuser -d cmdb -c "SELECT 1"
```

### مشكلة: Qdrant لا يعمل

```bash
# تحقق من Qdrant
curl http://localhost:6333/health

# إعادة تشغيل
docker restart bdfm-qdrant
```

### مشكلة: Ollama لا يستجيب

```bash
# تحقق من Ollama
curl http://localhost:11434/api/tags

# إعادة تشغيل (Windows)
# أعد تشغيل خدمة Ollama من Services
```

## التحديثات المستقبلية

### تحديث المكتبات:

```bash
# Conda
conda env update -f environment.yml --prune

# pip
pip install -r requirements.txt --upgrade
```

### تحديث Whisper model:

```bash
# تحميل نموذج أحدث
python -c "import whisper; whisper.load_model('large-v3')"
```

## الخطوات التالية

1. راجع [README.md](README.md) لمعرفة كيفية الاستخدام
2. راجع [docs/API.md](docs/API.md) لتفاصيل الـ API
3. جرّب أمثلة الاستخدام في README

## الدعم

للمشاكل، راجع:

-  ملف logs/bdfm-rag.log
-  GitHub Issues
-  فريق BDFM التقني
