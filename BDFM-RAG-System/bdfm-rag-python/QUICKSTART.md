# البدء السريع - BDFM RAG System 2.0

## التثبيت في 5 دقائق ⚡

### 1. إنشاء البيئة

```powershell
cd bdfm-rag-python

# Conda (موصى به)
conda env create -f environment.yml
conda activate bdfm-rag
```

### 2. إعداد الإعدادات

```powershell
# نسخ .env
copy .env.example .env

# تعديل حسب بيئتك
notepad .env
```

### 3. تشغيل Qdrant

```powershell
docker run -d -p 6333:6333 `
  -v ${PWD}/qdrant_storage:/qdrant/storage `
  --name bdfm-qdrant `
  qdrant/qdrant:latest
```

### 4. تشغيل التطبيق

```powershell
python run.py
```

الآن افتح: **http://localhost:3001**

### 5. المزامنة الأولية

```powershell
# في terminal جديد
curl -X POST http://localhost:3001/api/rag/sync `
  -H "Content-Type: application/json" `
  -d '{\"type\": \"full\", \"batch_size\": 100}'
```

---

## الاستخدام الأساسي

### RAG Query

```python
import requests

response = requests.post(
    "http://localhost:3001/api/rag/query",
    json={
        "query": "المراسلات المتعلقة بالموارد البشرية",
        "language": "ar"
    }
)

print(response.json()['data']['answer'])
```

### Speech-to-Text (الميزة الجديدة! ⭐)

```python
with open("audio.mp3", "rb") as f:
    response = requests.post(
        "http://localhost:3001/api/rag/speech/transcribe",
        files={"file": f},
        data={"language": "ar"}
    )

print(response.json()['data']['text'])
```

---

## التحقق من النظام

```powershell
# الصحة العامة
curl http://localhost:3001/health

# حالة النظام
curl http://localhost:3001/api/rag/status

# إحصائيات المزامنة
curl http://localhost:3001/api/rag/sync/stats
```

---

## الخطوات التالية

1. راجع [USAGE.md](USAGE.md) لأمثلة متقدمة
2. راجع [INSTALL.md](INSTALL.md) للتثبيت التفصيلي
3. راجع [MIGRATION.md](MIGRATION.md) للانتقال من Node.js

---

## المشاكل الشائعة

### Whisper بطيء؟

```env
# في .env - استخدم GPU
WHISPER_DEVICE=cuda
```

### Out of memory?

```env
# تقليل batch size
curl -X POST http://localhost:3001/api/rag/sync `
  -d '{\"type\": \"full\", \"batch_size\": 50}'
```

### Qdrant لا يعمل؟

```powershell
docker restart bdfm-qdrant
```

---

## API Documentation

افتح: **http://localhost:3001/docs** للـ Swagger UI التفاعلي

---

## الدعم

-  Logs: `logs/bdfm-rag.log`
-  Status: http://localhost:3001/api/rag/status
-  فريق BDFM التقني

**مدة التثبيت الكامل: ~5-10 دقائق** ⚡  
**مدة المزامنة الأولية: ~10-30 دقيقة** (حسب عدد المراسلات)
