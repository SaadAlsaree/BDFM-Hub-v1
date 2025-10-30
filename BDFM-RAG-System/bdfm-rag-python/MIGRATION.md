# دليل الانتقال من Node.js إلى Python

## نظرة عامة

هذا الدليل يساعدك على الانتقال من نظام BDFM RAG القديم (Node.js/TypeScript) إلى النسخة الجديدة (Python).

## لماذا الانتقال؟

### المميزات الرئيسية الجديدة

1. **✅ تكامل مباشر مع Whisper**

   -  لا حاجة لـ API خارجي
   -  أداء أفضل للغة العربية
   -  إمكانية fine-tuning

2. **✅ Embeddings عالية الجودة للعربية**

   -  `multilingual-e5-large` بدلاً من `nomic-embed`
   -  Dimension: 1024 بدلاً من 768
   -  دقة أعلى في البحث الدلالي

3. **✅ مزامنة تلقائية**
   -  PostgreSQL triggers للوقت الفعلي
   -  مزامنة تلقائية بدون تدخل يدوي

## خطوات الانتقال

### المرحلة 1: التحضير (يوم 1)

#### 1.1 نسخ احتياطي

```bash
# النظام القديم
cd BDFM-RAG-System

# نسخ احتياطي للبيانات
pg_dump -h cm-db.inss.local -U cmuser cmdb > backup_$(date +%Y%m%d).sql

# نسخ احتياطي لـ Qdrant (optional)
# النظام الجديد سيعيد بناء الفهرس
```

#### 1.2 توثيق الإعدادات الحالية

```bash
# احفظ نسخة من .env القديم
cp .env .env.nodejs.backup
```

#### 1.3 اختبار الاتصال بالخدمات

```bash
# PostgreSQL
psql -h cm-db.inss.local -U cmuser -d cmdb -c "SELECT COUNT(*) FROM \"Correspondences\""

# Qdrant
curl http://localhost:6333/health

# Ollama
curl http://localhost:11434/api/tags
```

### المرحلة 2: تثبيت النظام الجديد (يوم 1-2)

#### 2.1 إعداد Python Environment

```bash
cd bdfm-rag-python

# Conda (موصى به)
conda env create -f environment.yml
conda activate bdfm-rag

# أو pip
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### 2.2 إعداد .env

```bash
# نسخ مثال .env
copy .env.example .env

# استخدم نفس إعدادات PostgreSQL من النظام القديم
notepad .env
```

#### 2.3 اختبار التثبيت

```bash
# اختبار استيراد المكتبات
python -c "import fastapi; import sentence_transformers; import faster_whisper; print('OK')"
```

### المرحلة 3: إعداد PostgreSQL Triggers (اختياري - يوم 2)

```bash
# تشغيل SQL script للمزامنة التلقائية
psql -h cm-db.inss.local -U cmuser -d cmdb -f scripts/setup_pg_triggers.sql
```

### المرحلة 4: المزامنة الأولية (يوم 2)

#### 4.1 تشغيل النظام الجديد

```bash
# في terminal منفصل
python run.py
```

يجب أن يعمل على: http://localhost:3001

#### 4.2 التحقق من الاتصالات

```bash
# فحص الصحة
curl http://localhost:3001/health

# فحص الحالة
curl http://localhost:3001/api/rag/status
```

#### 4.3 المزامنة الأولية

```bash
# مزامنة كاملة (قد تأخذ وقتاً حسب عدد المراسلات)
curl -X POST http://localhost:3001/api/rag/sync `
  -H "Content-Type: application/json" `
  -d '{\"type\": \"full\", \"batch_size\": 100}'
```

**ملاحظة**: إذا كان لديك 10,000 مراسلة، قد تأخذ المزامنة 10-30 دقيقة.

#### 4.4 التحقق من المزامنة

```bash
# إحصائيات المزامنة
curl http://localhost:3001/api/rag/sync/stats
```

يجب أن ترى:

```json
{
   "postgresql": { "total": 10000 },
   "qdrant": { "total": 10000 },
   "synced": 10000,
   "pending": 0
}
```

### المرحلة 5: الاختبارات المقارنة (يوم 3)

#### 5.1 اختبار RAG Query

**النظام القديم (Node.js):**

```bash
curl -X POST http://localhost:3001/api/rag/query `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"المراسلات المتعلقة بالموارد البشرية\", \"language\": \"ar\"}'
```

**النظام الجديد (Python):**

```bash
# نفس الطلب - يجب أن تكون النتائج مشابهة أو أفضل
```

#### 5.2 اختبار Speech-to-Text (الميزة الجديدة!)

```bash
# هذه ميزة جديدة، لم تكن موجودة في النظام القديم
curl -X POST http://localhost:3001/api/rag/speech/transcribe `
  -F "file=@test_audio.mp3" `
  -F "language=ar"
```

#### 5.3 قياس الأداء

**Python Script للمقارنة:**

```python
import requests
import time

queries = [
    "المراسلات المتعلقة بالموارد البشرية",
    "كتب التوظيف",
    "المراسلات الواردة من الوزارة"
]

for query in queries:
    start = time.time()

    response = requests.post(
        "http://localhost:3001/api/rag/query",
        json={"query": query, "language": "ar"}
    )

    duration = (time.time() - start) * 1000

    result = response.json()['data']
    print(f"Query: {query[:30]}...")
    print(f"  Time: {duration:.0f}ms")
    print(f"  Results: {len(result['sources'])}")
    print()
```

### المرحلة 6: الانتقال التدريجي (يوم 4-7)

#### 6.1 اختبار تجريبي

-  شغّل النظامين معاً (على منافذ مختلفة)
-  وجّه 10% من الطلبات للنظام الجديد
-  راقب الأخطاء والأداء

#### 6.2 التوسع التدريجي

-  يوم 4: 10% Python
-  يوم 5: 25% Python
-  يوم 6: 50% Python
-  يوم 7: 100% Python

#### 6.3 إيقاف النظام القديم

```bash
# بعد التأكد من استقرار النظام الجديد
cd BDFM-RAG-System

# إيقاف Node.js server
# (حسب طريقة التشغيل لديك)
```

## مقارنة الـ API Endpoints

| الوظيفة   | Node.js (القديم)  | Python (الجديد)              | ملاحظات      |
| --------- | ----------------- | ---------------------------- | ------------ |
| RAG Query | `/api/rag/query`  | `/api/rag/query`             | نفسه ✅      |
| Search    | `/api/rag/search` | `/api/rag/search`            | نفسه ✅      |
| Sync      | `/api/rag/sync`   | `/api/rag/sync`              | نفسه ✅      |
| Speech    | ❌ غير موجود      | `/api/rag/speech/transcribe` | **جديد!** ⭐ |
| Status    | `/api/rag/status` | `/api/rag/status`            | نفسه ✅      |

## التوافق مع الـ Frontend

النظام الجديد متوافق 100% مع الـ API القديم:

```typescript
// كود الـ Frontend لا يحتاج تغيير!
const response = await fetch('/api/rag/query', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
      query: userQuery,
      language: 'ar'
   })
});
```

فقط غيّر الـ BASE_URL من القديم للجديد.

## استكشاف المشاكل

### مشكلة: النتائج مختلفة عن النظام القديم

**السبب**: نموذج embedding مختلف (e5-large vs nomic)

**الحل**: هذا متوقع! النموذج الجديد أفضل للعربية.

### مشكلة: المزامنة بطيئة

**الحل**:

```bash
# زيادة batch size
curl -X POST http://localhost:3001/api/rag/sync `
  -d '{\"type\": \"full\", \"batch_size\": 200}'
```

### مشكلة: Whisper بطيء

**الحل**:

```env
# في .env - استخدم GPU
WHISPER_DEVICE=cuda
```

### مشكلة: Out of memory

**الحل**:

```env
# تقليل batch size
# في .env أو في الطلب
"batch_size": 50
```

## الرجوع للنظام القديم (Plan B)

إذا واجهت مشاكل:

```bash
# 1. إيقاف Python server
# Ctrl+C

# 2. تشغيل Node.js server
cd BDFM-RAG-System
npm start

# 3. الرجوع لقاعدة البيانات القديمة (إذا لزم)
psql -h cm-db.inss.local -U cmuser cmdb < backup_YYYYMMDD.sql
```

## Checklist النهائي

-  [ ] نسخ احتياطي من PostgreSQL
-  [ ] تثبيت Python environment
-  [ ] إعداد .env
-  [ ] تشغيل Qdrant
-  [ ] تشغيل Ollama
-  [ ] تشغيل Python server
-  [ ] المزامنة الأولية
-  [ ] التحقق من sync stats
-  [ ] اختبار RAG query
-  [ ] اختبار Speech-to-Text
-  [ ] إعداد PostgreSQL triggers (اختياري)
-  [ ] اختبارات الأداء
-  [ ] اختبار تجريبي
-  [ ] انتقال تدريجي
-  [ ] إيقاف Node.js server

## الدعم

للمشاكل والأسئلة:

-  راجع logs في `logs/bdfm-rag.log`
-  افحص `http://localhost:3001/api/rag/status`
-  تواصل مع فريق BDFM التقني

---

**توقيت مقترح للانتقال الكامل: 1 أسبوع**

-  يوم 1-2: تثبيت وإعداد
-  يوم 3: اختبارات مقارنة
-  يوم 4-6: انتقال تدريجي
-  يوم 7: انتقال كامل

**الأولوية**: ابدأ بميزة Speech-to-Text الجديدة لأنها السبب الرئيسي للانتقال!
