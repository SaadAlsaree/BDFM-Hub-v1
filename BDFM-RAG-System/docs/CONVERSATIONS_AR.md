# نظام المحادثات - BDFM RAG

## نظرة عامة

نظام المحادثات يوفر تجربة تفاعلية حيث كل مستخدم له محادثاته الخاصة، وكل محادثة مستقلة تماماً عن البقية. يتم حفظ سياق كل محادثة ولا يختلط مع المحادثات الأخرى.

### المميزات

✅ **محادثات منفصلة**: كل محادثة لها سياقها الخاص المستقل
✅ **تعدد المحادثات**: يمكن للمستخدم الواحد إنشاء محادثات متعددة
✅ **سجل المحادثات**: حفظ كامل لتاريخ كل محادثة
✅ **ذاكرة السياق**: يتذكر النظام ما تم الحديث عنه في نفس المحادثة
✅ **عزل تام**: لا تختلط الإجابات بين المحادثات المختلفة

---

## البنية

### جداول قاعدة البيانات

#### 1. rag_conversations
```sql
CREATE TABLE rag_conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(500) NOT NULL,
  language VARCHAR(5) NOT NULL DEFAULT 'ar',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMP,
  message_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);
```

#### 2. rag_conversation_messages
```sql
CREATE TABLE rag_conversation_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES rag_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,  -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  sources JSONB,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## API Endpoints

### 1. إنشاء محادثة جديدة

**Endpoint:** `POST /api/rag/conversations`

**Request:**
```json
{
  "userId": "user-uuid-here",
  "title": "محادثة عن الموارد البشرية",
  "language": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conversation-uuid",
    "userId": "user-uuid",
    "title": "محادثة عن الموارد البشرية",
    "language": "ar",
    "createdAt": "2025-01-23T10:00:00.000Z",
    "updatedAt": "2025-01-23T10:00:00.000Z",
    "messageCount": 0,
    "isActive": true
  },
  "timestamp": "2025-01-23T10:00:00.000Z"
}
```

---

### 2. عرض جميع المحادثات للمستخدم

**Endpoint:** `GET /api/rag/conversations?userId={uuid}&limit=50&offset=0`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conversation-1-uuid",
      "userId": "user-uuid",
      "title": "محادثة عن الموارد البشرية",
      "language": "ar",
      "createdAt": "2025-01-23T10:00:00.000Z",
      "updatedAt": "2025-01-23T10:30:00.000Z",
      "lastMessageAt": "2025-01-23T10:30:00.000Z",
      "messageCount": 5,
      "isActive": true
    },
    {
      "id": "conversation-2-uuid",
      "userId": "user-uuid",
      "title": "محادثة عن المراسلات المالية",
      "language": "ar",
      "createdAt": "2025-01-22T14:00:00.000Z",
      "updatedAt": "2025-01-22T14:15:00.000Z",
      "lastMessageAt": "2025-01-22T14:15:00.000Z",
      "messageCount": 3,
      "isActive": true
    }
  ],
  "timestamp": "2025-01-23T11:00:00.000Z"
}
```

---

### 3. عرض محادثة مع الرسائل

**Endpoint:** `GET /api/rag/conversations/{id}?userId={uuid}`

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conversation-uuid",
      "userId": "user-uuid",
      "title": "محادثة عن الموارد البشرية",
      "language": "ar",
      "createdAt": "2025-01-23T10:00:00.000Z",
      "updatedAt": "2025-01-23T10:30:00.000Z",
      "lastMessageAt": "2025-01-23T10:30:00.000Z",
      "messageCount": 4,
      "isActive": true
    },
    "messages": [
      {
        "id": "message-1-uuid",
        "conversationId": "conversation-uuid",
        "role": "user",
        "content": "ما هي المراسلات المتعلقة بالتوظيف؟",
        "createdAt": "2025-01-23T10:05:00.000Z"
      },
      {
        "id": "message-2-uuid",
        "conversationId": "conversation-uuid",
        "role": "assistant",
        "content": "وجدت 3 مراسلات متعلقة بالتوظيف...",
        "sources": [...],
        "metadata": {...},
        "createdAt": "2025-01-23T10:05:10.000Z"
      },
      {
        "id": "message-3-uuid",
        "conversationId": "conversation-uuid",
        "role": "user",
        "content": "أريد المزيد من التفاصيل عن الأولى",
        "createdAt": "2025-01-23T10:10:00.000Z"
      },
      {
        "id": "message-4-uuid",
        "conversationId": "conversation-uuid",
        "role": "assistant",
        "content": "المراسلة الأولى التي ذكرتها سابقاً...",
        "sources": [...],
        "createdAt": "2025-01-23T10:10:15.000Z"
      }
    ]
  },
  "timestamp": "2025-01-23T11:00:00.000Z"
}
```

---

### 4. إرسال رسالة في محادثة

**Endpoint:** `POST /api/rag/conversations/message`

**Request:**
```json
{
  "conversationId": "conversation-uuid",
  "userId": "user-uuid",
  "message": "ما هي المراسلات المتعلقة بالموارد البشرية؟",
  "maxResults": 5,
  "similarityThreshold": 0.7,
  "filters": {
    "correspondenceType": ["Internal"],
    "priorityLevel": ["High"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "message-uuid",
    "conversationId": "conversation-uuid",
    "role": "assistant",
    "content": "وجدت 3 مراسلات متعلقة بالموارد البشرية...",
    "sources": [
      {
        "id": "correspondence-uuid",
        "mailNum": "500-2025",
        "subject": "طلب توظيف",
        "bodyText": "...",
        "similarityScore": 0.92
      }
    ],
    "metadata": {
      "queryProcessingTime": 2500,
      "embeddingTime": 150,
      "searchTime": 50,
      "generationTime": 2300
    },
    "createdAt": "2025-01-23T10:05:10.000Z"
  },
  "timestamp": "2025-01-23T10:05:10.000Z"
}
```

---

### 5. إرسال رسالة مع Streaming

**Endpoint:** `POST /api/rag/conversations/message/stream`

**Request:** Same as above

**Response:** Server-Sent Events (SSE)
```
data: {"type":"sources","content":[...]}

data: {"type":"answer_start","content":""}

data: {"type":"answer_chunk","content":"وجدت"}

data: {"type":"answer_chunk","content":" 3 مراسلات"}

data: {"type":"answer_chunk","content":" متعلقة..."}

data: {"type":"answer_end","content":""}
```

---

### 6. تحديث عنوان المحادثة

**Endpoint:** `PUT /api/rag/conversations/{id}/title`

**Request:**
```json
{
  "userId": "user-uuid",
  "title": "محادثة عن التوظيف والموارد البشرية"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conversation-uuid",
    "title": "محادثة عن التوظيف والموارد البشرية"
  },
  "timestamp": "2025-01-23T11:00:00.000Z"
}
```

---

### 7. حذف محادثة

**Endpoint:** `DELETE /api/rag/conversations/{id}?userId={uuid}`

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conversation-uuid",
    "deleted": true
  },
  "timestamp": "2025-01-23T11:00:00.000Z"
}
```

---

## أمثلة عملية

### مثال 1: إنشاء محادثة وإرسال رسائل

```javascript
const axios = require('axios');

async function chatExample() {
  const baseUrl = 'http://localhost:3001/api/rag';
  const userId = 'user-123-uuid';

  // 1. إنشاء محادثة جديدة
  const conversation = await axios.post(`${baseUrl}/conversations`, {
    userId,
    title: 'محادثة عن الموارد البشرية',
    language: 'ar'
  });

  const conversationId = conversation.data.data.id;
  console.log('تم إنشاء محادثة:', conversationId);

  // 2. إرسال رسالة أولى
  const msg1 = await axios.post(`${baseUrl}/conversations/message`, {
    conversationId,
    userId,
    message: 'ما هي المراسلات المتعلقة بالتوظيف؟'
  });

  console.log('الإجابة 1:', msg1.data.data.content);

  // 3. إرسال رسالة ثانية تعتمد على السياق
  const msg2 = await axios.post(`${baseUrl}/conversations/message`, {
    conversationId,
    userId,
    message: 'أريد المزيد من التفاصيل عن الأولى'
  });

  console.log('الإجابة 2:', msg2.data.data.content);
  // هنا النظام سيتذكر "الأولى" من المحادثة السابقة
}

chatExample();
```

### مثال 2: عرض جميع المحادثات

```javascript
async function listConversations(userId) {
  const response = await axios.get(
    `http://localhost:3001/api/rag/conversations?userId=${userId}`
  );

  console.log(`لديك ${response.data.data.length} محادثة:`);

  response.data.data.forEach((conv, index) => {
    console.log(`\n${index + 1}. ${conv.title}`);
    console.log(`   عدد الرسائل: ${conv.messageCount}`);
    console.log(`   آخر نشاط: ${conv.lastMessageAt}`);
  });
}
```

### مثال 3: Streaming Chat

```javascript
async function streamingChat(conversationId, userId, message) {
  const response = await fetch(
    'http://localhost:3001/api/rag/conversations/message/stream',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, userId, message })
    }
  );

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

        if (data.type === 'answer_chunk') {
          process.stdout.write(data.content);
        } else if (data.type === 'sources') {
          console.log('\n\nالمصادر:', data.content.length);
        }
      }
    }
  }
}
```

### مثال 4: تطبيق Web بسيط

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>BDFM Chat</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
        }
        #conversations {
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ddd;
        }
        #chat {
            border: 1px solid #ddd;
            height: 400px;
            overflow-y: scroll;
            padding: 10px;
            margin-bottom: 10px;
        }
        .message {
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
        }
        .user {
            background: #e3f2fd;
            text-align: left;
        }
        .assistant {
            background: #f5f5f5;
            text-align: right;
        }
        #input {
            width: 80%;
            padding: 10px;
        }
        button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>محادثة BDFM</h1>

    <div id="conversations">
        <select id="conv-select">
            <option value="">اختر محادثة...</option>
        </select>
        <button onclick="newConversation()">محادثة جديدة</button>
    </div>

    <div id="chat"></div>

    <input type="text" id="input" placeholder="اكتب رسالتك...">
    <button onclick="sendMessage()">إرسال</button>

    <script>
        const userId = 'user-123';
        let currentConvId = null;

        async function loadConversations() {
            const response = await fetch(
                `http://localhost:3001/api/rag/conversations?userId=${userId}`
            );
            const data = await response.json();

            const select = document.getElementById('conv-select');
            select.innerHTML = '<option value="">اختر محادثة...</option>';

            data.data.forEach(conv => {
                const option = document.createElement('option');
                option.value = conv.id;
                option.textContent = `${conv.title} (${conv.messageCount} رسالة)`;
                select.appendChild(option);
            });
        }

        async function newConversation() {
            const title = prompt('عنوان المحادثة:');
            if (!title) return;

            const response = await fetch(
                'http://localhost:3001/api/rag/conversations',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, title, language: 'ar' })
                }
            );

            const data = await response.json();
            currentConvId = data.data.id;
            document.getElementById('chat').innerHTML = '';
            loadConversations();
        }

        async function sendMessage() {
            const input = document.getElementById('input');
            const message = input.value.trim();
            if (!message || !currentConvId) return;

            // عرض رسالة المستخدم
            addMessage(message, 'user');
            input.value = '';

            // إرسال الرسالة
            const response = await fetch(
                'http://localhost:3001/api/rag/conversations/message',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversationId: currentConvId,
                        userId,
                        message
                    })
                }
            );

            const data = await response.json();
            addMessage(data.data.content, 'assistant');
        }

        function addMessage(content, role) {
            const chat = document.getElementById('chat');
            const div = document.createElement('div');
            div.className = `message ${role}`;
            div.textContent = content;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }

        document.getElementById('conv-select').addEventListener('change', async (e) => {
            currentConvId = e.target.value;
            if (!currentConvId) return;

            const response = await fetch(
                `http://localhost:3001/api/rag/conversations/${currentConvId}?userId=${userId}`
            );
            const data = await response.json();

            const chat = document.getElementById('chat');
            chat.innerHTML = '';

            data.data.messages.forEach(msg => {
                addMessage(msg.content, msg.role);
            });
        });

        // تحميل المحادثات عند بدء الصفحة
        loadConversations();
    </script>
</body>
</html>
```

---

## الميزات التقنية

### 1. عزل السياق

كل محادثة لها سياقها المستقل:
- يتم تخزين الرسائل في جدول منفصل مرتبط بـ conversation_id
- عند إنشاء الإجابة، يتم جلب آخر 5 رسائل من نفس المحادثة فقط
- لا يتم خلط الرسائل بين المحادثات المختلفة

### 2. الذاكرة السياقية

النظام يتذكر ما تم الحديث عنه:
```javascript
// المحادثة 1
المستخدم: "ما هي المراسلات عن التوظيف?"
المساعد: "وجدت 3 مراسلات: 500-2025، 501-2025، 502-2025"

المستخدم: "أريد تفاصيل الأولى"
المساعد: "المراسلة 500-2025 التي ذكرتها سابقاً هي..."
// هنا النظام يعرف أن "الأولى" تعني 500-2025
```

### 3. دعم متعدد المستخدمين

- كل مستخدم له userId مستقل
- يمكن لكل مستخدم إنشاء عدد غير محدود من المحادثات
- لا يمكن للمستخدم الوصول لمحادثات مستخدم آخر

### 4. الأداء

- استخدام Indexes على userId وconversation_id
- جلب آخر 5 رسائل فقط للسياق (قابل للتعديل)
- Cascade delete لحذف الرسائل عند حذف المحادثة

---

## الخلاصة

نظام المحادثات يوفر:
✅ عزل تام بين المحادثات
✅ ذاكرة سياقية لكل محادثة
✅ دعم متعدد المستخدمين
✅ تجربة مستخدم محسنة
✅ أداء عالي مع قابلية التوسع

---

**الإصدار:** 1.1.0
**التاريخ:** 2025-01-23
