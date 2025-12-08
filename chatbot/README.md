# Ollama Chatbot Backend

Backend كامل لتطبيق chatbot يتصل مع Ollama محلياً باستخدام Node.js, Express, TypeScript, و MongoDB مع Mongoose.

## المميزات

- 🔐 نظام مصادقة JWT
- 💬 إدارة المحادثات والرسائل
- 📎 دعم المرفقات (صور و PDF)
- 🤖 اتصال مع Ollama API
- 🔒 أمان عالي (Helmet, Rate Limiting)
- ✅ Validation شامل للبيانات
- 🛡️ معالجة أخطاء شاملة

## المتطلبات الأساسية

- Node.js (v18 أو أحدث)
- MongoDB (محلي أو MongoDB Atlas)
- Ollama مثبت ومشغل على `http://localhost:11434`

## التثبيت

### 1. تثبيت Dependencies

```bash
npm install
```

### 2. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع (يمكنك نسخ `.env.example` كقاعدة):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ollama-chatbot
OLLAMA_BASE_URL=http://localhost:11434
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**ملاحظات مهمة**: 
- قم بتغيير `JWT_SECRET` إلى قيمة عشوائية قوية في بيئة الإنتاج.
- **إذا كان MongoDB يتطلب authentication مع مستخدم root**، استخدم:
  ```env
  MONGODB_URI=mongodb://admin:AdminSaad@localhost:27017/ollama-chatbot?authSource=admin
  ```
- **إذا كان MongoDB يتطلب authentication مع مستخدم عادي**:
  ```env
  MONGODB_URI=mongodb://username:password@localhost:27017/ollama-chatbot
  ```
- **إذا كنت تستخدم MongoDB Atlas**:
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ollama-chatbot
  ```
- **للتطوير المحلي بدون authentication**، استخدم:
  ```env
  MONGODB_URI=mongodb://localhost:27017/ollama-chatbot
  ```

### 3. تشغيل MongoDB

تأكد من تشغيل MongoDB:

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
# أو
mongod
```

### 4. تشغيل Ollama

تأكد من تشغيل Ollama:

```bash
ollama serve
```

### 5. تثبيت موديلات Ollama (اختياري)

```bash
# مثال: تثبيت موديل llama2
ollama pull llama2

# مثال: تثبيت موديل يدعم الصور (llava)
ollama pull llava
```

## التشغيل

### وضع التطوير

```bash
npm run dev
```

### بناء المشروع

```bash
npm run build
```

### تشغيل الإنتاج

```bash
npm start
```

السيرفر سيعمل على `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### تسجيل مستخدم جديد

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "اسم المستخدم"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم التسجيل بنجاح",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "اسم المستخدم"
    }
  }
}
```

#### تسجيل الدخول

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "اسم المستخدم"
    }
  }
}
```

#### جلب معلومات المستخدم الحالي

```http
GET /api/auth/me
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "اسم المستخدم",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Ollama Routes (`/api/ollama`)

#### جلب قائمة الموديلات المتاحة

```http
GET /api/ollama/models
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "name": "llama2",
        "modifiedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Conversation Routes (`/api/conversations`)

#### جلب كل محادثات المستخدم

```http
GET /api/conversations?page=1&limit=10
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "_id": "conversation-id",
        "userId": "user-id",
        "title": "محادثة جديدة",
        "modelName": "llama2",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### إنشاء محادثة جديدة

```http
POST /api/conversations
Authorization: Bearer jwt-token-here
Content-Type: application/json

{
  "modelName": "llama2",
  "title": "محادثة جديدة"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إنشاء المحادثة بنجاح",
  "data": {
    "conversation": {
      "_id": "conversation-id",
      "userId": "user-id",
      "title": "محادثة جديدة",
      "modelName": "llama2",
      "messages": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### جلب محادثة محددة

```http
GET /api/conversations/:id
Authorization: Bearer jwt-token-here
```

#### تحديث عنوان المحادثة

```http
PUT /api/conversations/:id
Authorization: Bearer jwt-token-here
Content-Type: application/json

{
  "title": "عنوان جديد"
}
```

#### حذف محادثة

```http
DELETE /api/conversations/:id
Authorization: Bearer jwt-token-here
```

### Message Routes (`/api/conversations/:conversationId/messages`)

#### إرسال رسالة جديدة (مع دعم المرفقات والستريمنج)

```http
POST /api/conversations/:conversationId/messages
Authorization: Bearer jwt-token-here
Content-Type: multipart/form-data

content: "ما هذا؟"
modelName: "llama2" (مطلوب)
stream: true/false (اختياري - افتراضي false)
attachments: [File, File, ...] (اختياري - حد أقصى 5 ملفات)
```

**Response (عادي - stream=false):**
```json
{
  "success": true,
  "message": "تم إرسال الرسالة بنجاح",
  "data": {
    "message": {
      "role": "assistant",
      "content": "رد AI هنا",
      "attachments": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "conversationId": "conversation-id"
  }
}
```

**Response (streaming - stream=true):**
```
Content-Type: text/event-stream

data: {"content":"جزء","done":false}
data: {"content":" من","done":false}
data: {"content":" الرد","done":false}
data: {"done":true,"fullMessage":{...}}
```

#### جلب رسائل محادثة محددة

```http
GET /api/conversations/:conversationId/messages
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "role": "user",
        "content": "مرحبا",
        "attachments": [],
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "مرحبا بك!",
        "attachments": [],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Attachment Routes (`/api/attachments`)

#### جلب مرفق محدد

```http
GET /api/attachments/:conversationId/:messageIndex/:attachmentIndex
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attachment": {
      "type": "image",
      "filename": "image.jpg",
      "mimeType": "image/jpeg",
      "size": 12345,
      "base64Data": "data:image/jpeg;base64,...",
      "url": ""
    }
  }
}
```

## أنواع الملفات المدعومة

- **الصور**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **PDF**: `application/pdf`

**الحدود:**
- حد أقصى 5 ملفات لكل رسالة
- حد أقصى 10MB لكل ملف

## أمثلة على الاستخدام

### مثال: إرسال رسالة مع صورة

```bash
curl -X POST http://localhost:5000/api/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=ما هذا في الصورة؟" \
  -F "attachments=@/path/to/image.jpg"
```

### مثال: إنشاء محادثة جديدة وإرسال رسالة

```bash
# 1. إنشاء محادثة
CONVERSATION_ID=$(curl -X POST http://localhost:5000/api/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"modelName":"llama2","title":"محادثة جديدة"}' \
  | jq -r '.data.conversation._id')

# 2. إرسال رسالة
curl -X POST http://localhost:5000/api/conversations/$CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=مرحبا"
```

## هيكل المشروع

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # اتصال MongoDB
│   │   └── ollama.ts          # إعدادات Ollama
│   ├── models/
│   │   ├── User.ts            # نموذج المستخدم
│   │   ├── Conversation.ts    # نموذج المحادثة
│   │   ├── Message.ts         # Schema الرسالة
│   │   └── Attachment.ts      # Schema المرفق
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── errorHandler.middleware.ts  # معالجة الأخطاء
│   │   └── upload.middleware.ts    # Multer config
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── conversation.routes.ts
│   │   ├── message.routes.ts
│   │   ├── ollama.routes.ts
│   │   └── attachment.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── conversation.controller.ts
│   │   ├── message.controller.ts
│   │   └── ollama.controller.ts
│   ├── utils/
│   │   ├── validation.ts      # Express-validator rules
│   │   └── helpers.ts         # دوال مساعدة
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Entry point
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## الأمان

- **JWT Authentication**: جميع endpoints (عدا register/login) تحتاج token
- **Helmet**: Security headers
- **Rate Limiting**: 100 طلب كل 15 دقيقة لكل IP
- **Password Hashing**: bcryptjs مع salt rounds = 12
- **Input Validation**: Express-validator على كل input
- **CORS**: قابل للتخصيص عبر `CORS_ORIGIN`

## معالجة الأخطاء

جميع الأخطاء يتم معالجتها بشكل مركزي عبر `errorHandler.middleware.ts`. الرسائل تكون بالعربية وواضحة للمستخدم.

## ملاحظات مهمة

1. **عزل المحادثات**: كل محادثة لها session منفصل في Ollama باستخدام `keep_alive: 0`
2. **Session Management**: عند إرسال رسالة، يتم إرسال كل رسائل المحادثة لـ Ollama للحفاظ على السياق
3. **المرفقات**: الصور يتم تحويلها لـ base64 قبل الإرسال لـ Ollama
4. **الموديلات المدعومة للصور**: استخدم موديلات مثل `llava` أو `bakllava` للصور

## استكشاف الأخطاء

### خطأ: "لا يمكن الاتصال بـ Ollama"

- تأكد من تشغيل Ollama: `ollama serve`
- تحقق من `OLLAMA_BASE_URL` في `.env`
- تأكد من أن Ollama يعمل على `http://localhost:11434`

### خطأ: "فشل الاتصال بقاعدة البيانات"

- تأكد من تشغيل MongoDB
- تحقق من `MONGODB_URI` في `.env`
- تأكد من أن MongoDB يعمل على المنفذ الصحيح

### خطأ: "Command find requires authentication"

- إذا كان MongoDB يتطلب authentication، قم بتحديث `MONGODB_URI` في `.env`:
  ```
  MONGODB_URI=mongodb://username:password@localhost:27017/ollama-chatbot
  ```
- أو قم بإزالة authentication من MongoDB (للتطوير فقط):
  ```bash
  # في MongoDB shell
  use admin
  db.createUser({user: "admin", pwd: "password", roles: ["root"]})
  ```

### خطأ: "Token غير صحيح"

- تأكد من إرسال token في header: `Authorization: Bearer YOUR_TOKEN`
- تحقق من أن token لم ينتهِ صلاحيته (7 أيام)
- تأكد من `JWT_SECRET` في `.env`

## التطوير المستقبلي

- [x] دعم Streaming للردود الطويلة
- [ ] دعم أنواع ملفات إضافية
- [ ] تحسين الأداء مع caching
- [ ] إضافة logging متقدم
- [ ] دعم WebSocket للرسائل الفورية

## الرخصة

ISC

## المساهمة

نرحب بالمساهمات! يرجى فتح issue أو pull request.

