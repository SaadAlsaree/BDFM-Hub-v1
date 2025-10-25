# دليل استخدام نظام BDFM RAG

## جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [التثبيت والإعداد](#التثبيت-والإعداد)
3. [الاستخدام الأساسي](#الاستخدام-الأساسي)
4. [API Endpoints](#api-endpoints)
5. [أمثلة عملية](#أمثلة-عملية)
6. [الإعدادات المتقدمة](#الإعدادات-المتقدمة)
7. [استكشاف الأخطاء وإصلاحها](#استكشاف-الأخطاء-وإصلاحها)

---

## نظرة عامة

نظام BDFM RAG هو نظام ذكاء اصطناعي متطور يوفر إمكانيات RAG (Retrieval-Augmented Generation) لنظام إدارة المراسلات BDFM.Hub. يستخدم النظام تقنيات حديثة للبحث الدلالي والإجابة على الأسئلة.

### المميزات الرئيسية

- **البحث الدلالي**: البحث عن المراسلات بناءً على المعنى وليس الكلمات المطابقة فقط
- **الإجابات الذكية**: توليد إجابات تفصيلية مع المصادر
- **المزامنة التلقائية**: مزامنة البيانات من PostgreSQL إلى Qdrant
- **دعم اللغة العربية**: دعم كامل للغة العربية في البحث والإجابات
- **أداء عالي**: استخدام Qdrant لبحث سريع وفعال

---

## التثبيت والإعداد

### المتطلبات الأساسية

1. **Node.js** (v18 أو أحدث)
```bash
node --version  # يجب أن يكون >= 18
```

2. **Qdrant** (Vector Database)
```bash
# باستخدام Docker
docker run -d -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant

# أو باستخدام docker-compose
docker-compose up -d qdrant
```

3. **Ollama** مع النماذج المطلوبة
```bash
# تثبيت Ollama
curl -fsSL https://ollama.com/install.sh | sh

# تحميل النماذج
ollama pull qwen2.5:3b      # نموذج Embeddings
ollama pull gpt-oss:20b     # نموذج LLM للإجابات
```

### خطوات التثبيت

#### 1. استنساخ المشروع
```bash
cd BDFM-RAG-System
```

#### 2. تثبيت المكتبات
```bash
npm install
```

#### 3. إعداد ملف البيئة
```bash
cp .env.example .env
```

قم بتعديل ملف `.env` بالإعدادات الخاصة بك:
```env
# إعدادات الخادم
PORT=3001
NODE_ENV=development

# إعدادات PostgreSQL (قاعدة بيانات BDFM الأساسية)
POSTGRES_HOST=cm-db.inss.local
POSTGRES_PORT=5432
POSTGRES_DB=cmdb
POSTGRES_USER=cmuser
POSTGRES_PASSWORD=@DYKMk7xjB25

# إعدادات Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# إعدادات Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=qwen2.5:3b
OLLAMA_CHAT_MODEL=gpt-oss:20b

# إعدادات RAG
EMBEDDING_DIMENSION=3584
CHUNK_SIZE=500
MAX_RESULTS=10
SIMILARITY_THRESHOLD=0.7
```

#### 4. تشغيل النظام

**وضع التطوير:**
```bash
npm run dev
```

**وضع الإنتاج:**
```bash
npm run build
npm start
```

#### 5. المزامنة الأولية

قم بمزامنة المراسلات من قاعدة البيانات:
```bash
npm run sync
```

---

## الاستخدام الأساسي

### 1. التحقق من حالة النظام

```bash
curl http://localhost:3001/api/rag/status
```

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "qdrant": {
      "connected": true,
      "collections": {
        "bdfm_correspondences": 1250
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

### 2. الاستعلام عن المراسلات

```bash
curl -X POST http://localhost:3001/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ما هي المراسلات الخاصة بالموارد البشرية؟",
    "language": "ar",
    "maxResults": 5
  }'
```

---

## API Endpoints

### 1. الاستعلام مع RAG
**Endpoint:** `POST /api/rag/query`

**الطلب:**
```json
{
  "query": "ما هي المراسلات المتعلقة بالموارد البشرية؟",
  "language": "ar",
  "maxResults": 10,
  "similarityThreshold": 0.7,
  "filters": {
    "correspondenceType": ["Internal"],
    "priorityLevel": ["High", "Urgent"],
    "dateFrom": "2025-01-01",
    "dateTo": "2025-01-31"
  }
}
```

**الاستجابة:**
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
        "bodyText": "يرجى التكرم بالموافقة...",
        "similarityScore": 0.92,
        "mailDate": "2025-01-15",
        "priorityLevel": "High"
      }
    ],
    "language": "ar",
    "metadata": {
      "queryProcessingTime": 2500,
      "embeddingTime": 150,
      "searchTime": 50,
      "generationTime": 2300
    }
  }
}
```

### 2. الاستعلام مع Streaming
**Endpoint:** `POST /api/rag/query/stream`

```javascript
const response = await fetch('http://localhost:3001/api/rag/query/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'ما هي المراسلات الخاصة بالتوظيف؟',
    language: 'ar'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log(data);
    }
  }
}
```

### 3. البحث بدون LLM
**Endpoint:** `POST /api/rag/search`

```json
{
  "query": "التوظيف",
  "maxResults": 5,
  "threshold": 0.8
}
```

**الاستجابة:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "mailNum": "500-2025",
      "subject": "طلب توظيف",
      "bodyText": "...",
      "similarityScore": 0.92,
      "highlights": ["...طلب توظيف...", "...الموارد البشرية..."]
    }
  ]
}
```

### 4. المزامنة
**Endpoint:** `POST /api/rag/sync`

```json
{
  "type": "full",
  "batchSize": 100
}
```

**للمزامنة التزايدية:**
```json
{
  "type": "incremental",
  "fromDate": "2025-01-20",
  "batchSize": 50
}
```

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "synced": 1250,
    "failed": 0,
    "duration": "2m 30s"
  }
}
```

### 5. فهرسة مراسلة واحدة
**Endpoint:** `POST /api/rag/index`

```json
{
  "correspondenceId": "uuid-here"
}
```

### 6. حذف مراسلة من الفهرس
**Endpoint:** `DELETE /api/rag/correspondence/{id}`

```bash
curl -X DELETE http://localhost:3001/api/rag/correspondence/uuid-here
```

### 7. إحصائيات المزامنة
**Endpoint:** `GET /api/rag/sync/stats`

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "postgresql": {
      "total": 1250
    },
    "qdrant": {
      "total": 1250
    },
    "synced": 1250,
    "pending": 0
  }
}
```

### 8. إعادة بناء الفهرس
**Endpoint:** `POST /api/rag/rebuild`

⚠️ **تحذير**: هذه العملية تحذف جميع البيانات وتعيد المزامنة من البداية

```bash
curl -X POST http://localhost:3001/api/rag/rebuild
```

---

## أمثلة عملية

### مثال 1: البحث عن مراسلات معينة

```javascript
// استخدام JavaScript/Node.js
const axios = require('axios');

async function searchCorrespondences() {
  try {
    const response = await axios.post('http://localhost:3001/api/rag/query', {
      query: 'أريد معلومات عن طلبات الإجازات المقدمة في يناير',
      language: 'ar',
      maxResults: 10,
      filters: {
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31'
      }
    });

    console.log('الإجابة:', response.data.data.answer);
    console.log('عدد المراسلات:', response.data.data.sources.length);

    response.data.data.sources.forEach((source, index) => {
      console.log(`\nمراسلة ${index + 1}:`);
      console.log(`  الرقم: ${source.mailNum}`);
      console.log(`  الموضوع: ${source.subject}`);
      console.log(`  التشابه: ${(source.similarityScore * 100).toFixed(1)}%`);
    });
  } catch (error) {
    console.error('خطأ:', error.message);
  }
}

searchCorrespondences();
```

### مثال 2: المزامنة المجدولة

```javascript
// مزامنة تلقائية كل ساعة
const cron = require('node-cron');
const axios = require('axios');

cron.schedule('0 * * * *', async () => {
  console.log('بدء المزامنة التزايدية...');

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    const response = await axios.post('http://localhost:3001/api/rag/sync', {
      type: 'incremental',
      fromDate: oneHourAgo.toISOString().split('T')[0],
      batchSize: 50
    });

    console.log('المزامنة مكتملة:', response.data.data);
  } catch (error) {
    console.error('خطأ في المزامنة:', error.message);
  }
});
```

### مثال 3: تطبيق ويب بسيط

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>BDFM RAG - البحث الذكي</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        #query {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            margin-bottom: 10px;
        }
        button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
        }
        #result {
            margin-top: 20px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 5px;
        }
        .source {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-right: 3px solid #007bff;
        }
    </style>
</head>
<body>
    <h1>البحث الذكي في المراسلات</h1>

    <input type="text" id="query" placeholder="اكتب استفسارك هنا...">
    <button onclick="search()">بحث</button>

    <div id="result"></div>

    <script>
        async function search() {
            const query = document.getElementById('query').value;
            const resultDiv = document.getElementById('result');

            if (!query) {
                alert('الرجاء إدخال استفسار');
                return;
            }

            resultDiv.innerHTML = 'جاري البحث...';

            try {
                const response = await fetch('http://localhost:3001/api/rag/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: query,
                        language: 'ar',
                        maxResults: 5
                    })
                });

                const data = await response.json();

                if (data.success) {
                    let html = `<h3>الإجابة:</h3><p>${data.data.answer}</p>`;
                    html += `<h3>المصادر (${data.data.sources.length}):</h3>`;

                    data.data.sources.forEach((source, index) => {
                        html += `
                            <div class="source">
                                <strong>${index + 1}. ${source.mailNum}</strong> - ${source.mailDate}<br>
                                <strong>الموضوع:</strong> ${source.subject}<br>
                                <strong>التشابه:</strong> ${(source.similarityScore * 100).toFixed(1)}%
                            </div>
                        `;
                    });

                    resultDiv.innerHTML = html;
                } else {
                    resultDiv.innerHTML = `<p style="color: red;">خطأ: ${data.error.message}</p>`;
                }
            } catch (error) {
                resultDiv.innerHTML = `<p style="color: red;">خطأ: ${error.message}</p>`;
            }
        }

        // السماح بالبحث عند الضغط على Enter
        document.getElementById('query').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                search();
            }
        });
    </script>
</body>
</html>
```

---

## الإعدادات المتقدمة

### 1. ضبط جودة النتائج

لزيادة دقة النتائج، قم برفع `SIMILARITY_THRESHOLD`:
```env
SIMILARITY_THRESHOLD=0.85
```

لزيادة عدد النتائج:
```env
MAX_RESULTS=20
```

### 2. تحسين الأداء

لمعالجة أسرع، قلل حجم القطع:
```env
CHUNK_SIZE=300
CHUNK_OVERLAP=30
```

لمزامنة أسرع، زد حجم الدفعة:
```env
# في ملف .env أو عند استدعاء API
"batchSize": 200
```

### 3. الفلاتر المتقدمة

```javascript
const filters = {
  correspondenceType: ['Internal', 'IncomingExternal'],
  priorityLevel: ['High', 'Urgent'],
  secrecyLevel: ['None'],
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  organizationalUnitId: 'unit-uuid-here'
};

const response = await axios.post('http://localhost:3001/api/rag/query', {
  query: 'استفسارك هنا',
  filters: filters
});
```

### 4. Webhooks للمزامنة التلقائية

يمكنك إنشاء webhook في نظام BDFM الأساسي لتحديث الفهرس تلقائياً:

```javascript
// في نظام BDFM - بعد إنشاء/تحديث مراسلة
app.post('/api/correspondence', async (req, res) => {
  // حفظ المراسلة
  const correspondence = await saveCorrespondence(req.body);

  // تحديث الفهرس
  await axios.post('http://localhost:3001/api/rag/index', {
    correspondenceId: correspondence.id
  });

  res.json(correspondence);
});
```

---

## استكشاف الأخطاء وإصلاحها

### 1. خطأ: "Qdrant connection failed"

**الحل:**
```bash
# تحقق من تشغيل Qdrant
docker ps | grep qdrant

# إعادة تشغيل Qdrant
docker-compose restart qdrant

# تحقق من الاتصال
curl http://localhost:6333/collections
```

### 2. خطأ: "Ollama model not available"

**الحل:**
```bash
# تحقق من تشغيل Ollama
curl http://localhost:11434/api/tags

# تحميل النماذج المطلوبة
ollama pull qwen2.5:3b
ollama pull gpt-oss:20b

# تحقق من النماذج المتوفرة
ollama list
```

### 3. خطأ: "Database connection failed"

**الحل:**
```bash
# تحقق من إعدادات قاعدة البيانات في .env
cat .env | grep POSTGRES

# اختبر الاتصال
psql -h cm-db.inss.local -U cmuser -d cmdb -c "SELECT 1"
```

### 4. النتائج غير دقيقة

**الحلول:**
1. رفع `SIMILARITY_THRESHOLD` إلى 0.85
2. زيادة `MAX_RESULTS` للحصول على مزيد من النتائج
3. استخدام استعلامات أكثر تحديداً
4. إعادة بناء الفهرس: `POST /api/rag/rebuild`

### 5. بطء في الأداء

**الحلول:**
1. تقليل `MAX_RESULTS`
2. تقليل `CHUNK_SIZE`
3. زيادة موارد الخادم
4. استخدام نماذج أصغر في Ollama

### 6. عرض السجلات للتشخيص

```bash
# عرض جميع السجلات
tail -f logs/bdfm-rag.log

# عرض الأخطاء فقط
tail -f logs/error.log

# البحث في السجلات
grep "ERROR" logs/bdfm-rag.log
```

---

## الصيانة والنسخ الاحتياطي

### 1. النسخ الاحتياطي لـ Qdrant

```bash
# إيقاف الخدمة
docker-compose stop qdrant

# نسخ احتياطي
tar -czf qdrant_backup_$(date +%Y%m%d).tar.gz qdrant_storage/

# إعادة تشغيل الخدمة
docker-compose start qdrant
```

### 2. استعادة من نسخة احتياطية

```bash
# إيقاف الخدمة
docker-compose stop qdrant

# استعادة
tar -xzf qdrant_backup_20250123.tar.gz

# إعادة تشغيل
docker-compose start qdrant
```

### 3. مراقبة الأداء

```bash
# استخدام الذاكرة
docker stats bdfm-qdrant

# حجم البيانات
du -sh qdrant_storage/

# عدد المراسلات المفهرسة
curl http://localhost:3001/api/rag/sync/stats
```

---

## الدعم والمساعدة

للحصول على المساعدة:
1. راجع هذا الدليل
2. تحقق من السجلات: `logs/bdfm-rag.log`
3. تواصل مع فريق الدعم الفني

---

**آخر تحديث:** 2025-01-23
**الإصدار:** 1.0.0
