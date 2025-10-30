بداية سريعة - أمثلة استخدام BDFM RAG System

## تشغيل النظام

```bash
# تفعيل البيئة
conda activate bdfm-rag

# تشغيل السيرفر
python run.py
```

## أمثلة الاستخدام

### 1. استعلام RAG بسيط

#### Python

```python
import requests

response = requests.post(
    "http://localhost:3001/api/rag/query",
    json={
        "query": "ما هي المراسلات المتعلقة بالموارد البشرية؟",
        "language": "ar",
        "max_results": 5
    }
)

result = response.json()
print(f"الإجابة: {result['data']['answer']}")
print(f"عدد المصادر: {len(result['data']['sources'])}")
```

#### cURL (PowerShell)

```powershell
curl -X POST http://localhost:3001/api/rag/query `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"المراسلات المتعلقة بالتوظيف\", \"language\": \"ar\"}'
```

### 2. البحث الدلالي (بدون LLM)

```python
import requests

response = requests.post(
    "http://localhost:3001/api/rag/search",
    json={
        "query": "توظيف موظفين",
        "max_results": 10,
        "threshold": 0.8
    }
)

results = response.json()['data']
for result in results:
    print(f"- {result['mail_num']}: {result['subject']}")
    print(f"  التشابه: {result['similarity_score']:.2%}")
```

### 3. تحويل الصوت إلى نص (الميزة الجديدة!)

#### Python

```python
import requests

# نسخ ملف صوتي
with open("audio.mp3", "rb") as f:
    files = {"file": f}
    data = {"language": "ar"}

    response = requests.post(
        "http://localhost:3001/api/rag/speech/transcribe",
        files=files,
        data=data
    )

result = response.json()
print(f"النص: {result['data']['text']}")
print(f"اللغة المكتشفة: {result['data']['language']}")
```

#### cURL

```powershell
curl -X POST http://localhost:3001/api/rag/speech/transcribe `
  -F "file=@audio.mp3" `
  -F "language=ar"
```

### 4. نسخ صوت من URL

```python
response = requests.post(
    "http://localhost:3001/api/rag/speech/transcribe-url",
    json={
        "url": "https://example.com/audio.mp3",
        "language": "ar"
    }
)

print(response.json()['data']['text'])
```

### 5. كشف لغة الملف الصوتي

```python
with open("audio.mp3", "rb") as f:
    response = requests.post(
        "http://localhost:3001/api/rag/speech/detect-language",
        files={"file": f}
    )

language = response.json()['data']['language']
print(f"اللغة المكتشفة: {language}")
```

### 6. مزامنة المراسلات

#### مزامنة كاملة

```python
response = requests.post(
    "http://localhost:3001/api/rag/sync",
    json={
        "type": "full",
        "batch_size": 100
    }
)

result = response.json()['data']
print(f"تمت المزامنة: {result['synced']} مراسلة")
print(f"المدة: {result['duration']}")
```

#### مزامنة تزايدية (منذ تاريخ محدد)

```python
response = requests.post(
    "http://localhost:3001/api/rag/sync",
    json={
        "type": "incremental",
        "from_date": "2025-01-25",
        "batch_size": 50
    }
)
```

### 7. فهرسة مراسلة واحدة

```python
response = requests.post(
    "http://localhost:3001/api/rag/index",
    json={
        "correspondence_id": "your-uuid-here"
    }
)

print(response.json())
```

### 8. حذف مراسلة من الفهرس

```python
correspondence_id = "your-uuid-here"

response = requests.delete(
    f"http://localhost:3001/api/rag/correspondence/{correspondence_id}"
)

print(response.json())
```

### 9. فحص حالة النظام

```python
response = requests.get("http://localhost:3001/api/rag/status")

status = response.json()['data']

print("Qdrant:", status['qdrant']['connected'])
print("Ollama:", status['ollama']['connected'])
print("Embedding Model:", status['embedding']['model'])

for collection, count in status['qdrant']['collections'].items():
    print(f"  {collection}: {count} vectors")
```

### 10. إحصائيات المزامنة

```python
response = requests.get("http://localhost:3001/api/rag/sync/stats")

stats = response.json()['data']

print(f"PostgreSQL: {stats['postgresql']['total']} مراسلة")
print(f"Qdrant: {stats['qdrant']['total']} مراسلة")
print(f"قيد الانتظار: {stats['pending']} مراسلة")
```

### 11. RAG مع Streaming (للإجابات الطويلة)

```python
import requests
import json

response = requests.post(
    "http://localhost:3001/api/rag/query/stream",
    json={
        "query": "اشرح نظام المراسلات الإلكترونية",
        "language": "ar"
    },
    stream=True
)

print("الإجابة: ", end="", flush=True)

for line in response.iter_lines():
    if line:
        line_text = line.decode('utf-8')
        if line_text.startswith('data: '):
            data = json.loads(line_text[6:])

            if data['type'] == 'answer_chunk':
                print(data['content'], end="", flush=True)

print()  # New line
```

## سيناريوهات استخدام متقدمة

### سيناريو 1: معالجة رسالة صوتية والبحث عنها

```python
# 1. نسخ الرسالة الصوتية
with open("voice_message.mp3", "rb") as f:
    transcribe_response = requests.post(
        "http://localhost:3001/api/rag/speech/transcribe",
        files={"file": f},
        data={"language": "ar"}
    )

text = transcribe_response.json()['data']['text']
print(f"النص المنسوخ: {text}")

# 2. البحث عن المراسلات المشابهة
search_response = requests.post(
    "http://localhost:3001/api/rag/query",
    json={
        "query": text,
        "language": "ar",
        "max_results": 3
    }
)

answer = search_response.json()['data']['answer']
print(f"\nالإجابة: {answer}")
```

### سيناريو 2: معالجة دفعة من المراسلات

```python
# قائمة معرفات المراسلات للفهرسة
correspondence_ids = [
    "uuid-1",
    "uuid-2",
    "uuid-3"
]

# فهرسة كل واحدة
for corr_id in correspondence_ids:
    response = requests.post(
        "http://localhost:3001/api/rag/index",
        json={"correspondence_id": corr_id}
    )

    if response.json()['success']:
        print(f"✓ تمت فهرسة {corr_id}")
    else:
        print(f"✗ فشلت فهرسة {corr_id}")
```

### سيناريو 3: مراقبة أداء النظام

```python
import time

def monitor_system(interval=60):
    """مراقبة النظام كل دقيقة"""
    while True:
        response = requests.get("http://localhost:3001/api/rag/status")
        status = response.json()['data']

        print(f"\n[{time.strftime('%H:%M:%S')}] حالة النظام:")
        print(f"  Qdrant: {'✓' if status['qdrant']['connected'] else '✗'}")
        print(f"  Ollama: {'✓' if status['ollama']['connected'] else '✗'}")

        # إحصائيات المزامنة
        stats_response = requests.get("http://localhost:3001/api/rag/sync/stats")
        stats = stats_response.json()['data']

        print(f"  قيد الانتظار للمزامنة: {stats['pending']}")

        time.sleep(interval)

# تشغيل المراقبة
# monitor_system()
```

## استكشاف الأخطاء

### خطأ: Connection refused

```python
# تحقق من تشغيل السيرفر
response = requests.get("http://localhost:3001/health")
if response.status_code == 200:
    print("السيرفر يعمل!")
```

### خطأ: Whisper model not available

```python
# تحميل النموذج يدوياً
import whisper
model = whisper.load_model("large-v3")
print("تم تحميل النموذج!")
```

### خطأ: Slow embedding generation

```python
# استخدم batch processing للمراسلات المتعددة
# ستكون أسرع من معالجة كل واحدة على حدة
response = requests.post(
    "http://localhost:3001/api/rag/sync",
    json={
        "type": "full",
        "batch_size": 50  # batch أصغر للذاكرة المحدودة
    }
)
```

## نصائح للأداء

1. **استخدم GPU للـ Whisper**: ضع `WHISPER_DEVICE=cuda` في `.env`
2. **زيادة batch size**: للمزامنة الأسرع: `batch_size=200`
3. **Cache الاستعلامات المتكررة**: النظام يستخدم similarity search
4. **استخدم streaming** للإجابات الطويلة لتجربة مستخدم أفضل

## الموارد

-  [README.md](README.md) - نظرة عامة
-  [INSTALL.md](INSTALL.md) - دليل التثبيت
-  API Swagger Docs: http://localhost:3001/docs
-  Qdrant Dashboard: http://localhost:6333/dashboard

## الدعم

للمشاكل والأسئلة:

-  راجع logs في `logs/bdfm-rag.log`
-  تواصل مع فريق BDFM
-  افتح issue على GitHub
