# دليل نظام تحويل الصوت إلى نص (Speech-to-Text)

## نظرة عامة

نظام تحويل الصوت إلى نص يتيح لك التفاعل مع المساعد الذكي عن طريق الصوت بدلاً من الكتابة. يستخدم النظام تقنية Whisper لتحويل الملفات الصوتية إلى نص بدقة عالية ويدعم اللغتين العربية والإنجليزية.

## المميزات

✅ **تحويل دقيق**: دقة عالية في التعرف على الصوت باللغتين العربية والإنجليزية
✅ **صيغ متعددة**: دعم MP3, WAV, OGG, M4A, WEBM, FLAC
✅ **تكامل كامل**: تكامل مباشر مع نظام المحادثات الذكية
✅ **استجابة فورية**: دعم الاستجابة المباشرة (Streaming)
✅ **كشف اللغة**: كشف تلقائي للغة الصوت

## المتطلبات

### 1. تثبيت Whisper API

يحتاج النظام إلى Whisper API للعمل. يمكنك تثبيته بأحد الطرق التالية:

#### الطريقة 1: Whisper.cpp Server

```bash
# Clone whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp

# Build
make

# Download model (recommended: base or small for better performance)
bash ./models/download-ggml-model.sh base

# Run server
./server -m models/ggml-base.bin --port 8080
```

#### الطريقة 2: استخدام Docker

```bash
docker run -d -p 8080:8080 \
  -v /path/to/models:/models \
  ggerganov/whisper.cpp:latest \
  server -m /models/ggml-base.bin
```

### 2. تحديث متغيرات البيئة

أضف المتغيرات التالية إلى ملف `.env`:

```env
# Whisper API Configuration
WHISPER_API_URL=http://localhost:8080/v1/audio/transcriptions
WHISPER_MODEL=whisper:latest
MAX_AUDIO_FILE_SIZE=26214400  # 25MB
MAX_AUDIO_DURATION=600         # 10 minutes
UPLOAD_DIR=uploads/audio
```

## API Endpoints

### 1. تحويل ملف صوتي إلى نص

```
POST /api/rag/speech/transcribe
```

**Headers:**
```
Content-Type: multipart/form-data
```

**Body Parameters:**
- `audio` (file, required): الملف الصوتي
- `language` (string, optional): اللغة ('ar', 'en', أو 'auto' للكشف التلقائي) - القيمة الافتراضية: 'auto'
- `responseFormat` (string, optional): صيغة الاستجابة ('text', 'json', 'verbose_json') - القيمة الافتراضية: 'json'

**مثال باستخدام cURL:**

```bash
curl -X POST http://localhost:3001/api/rag/speech/transcribe \
  -F "audio=@audio.mp3" \
  -F "language=ar" \
  -F "responseFormat=json"
```

**مثال باستخدام JavaScript:**

```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('language', 'ar');

const response = await fetch('http://localhost:3001/api/rag/speech/transcribe', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('النص:', result.data.text);
```

**استجابة ناجحة:**

```json
{
  "success": true,
  "data": {
    "text": "أريد الاستعلام عن المراسلة رقم 123",
    "language": "ar",
    "metadata": {
      "fileSize": 245760,
      "format": "mp3",
      "processingTime": 1234
    }
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### 2. تحويل ملف صوتي من URL

```
POST /api/rag/speech/transcribe-url
```

**Body (JSON):**
```json
{
  "url": "https://example.com/audio.mp3",
  "language": "ar",
  "responseFormat": "json"
}
```

**مثال:**

```bash
curl -X POST http://localhost:3001/api/rag/speech/transcribe-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/audio.mp3",
    "language": "ar"
  }'
```

---

### 3. إرسال رسالة صوتية في محادثة

هذا الـ endpoint يقوم بـ:
1. تحويل الصوت إلى نص
2. إرسال النص كرسالة في المحادثة
3. الحصول على رد من نظام RAG

```
POST /api/rag/speech/voice-message
```

**Body Parameters:**
- `audio` (file, required): الملف الصوتي
- `conversationId` (string, required): معرّف المحادثة
- `userId` (string, required): معرّف المستخدم
- `language` (string, optional): اللغة - القيمة الافتراضية: 'auto'
- `maxResults` (number, optional): عدد النتائج القصوى من RAG
- `similarityThreshold` (number, optional): حد التشابه للبحث

**مثال:**

```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('conversationId', 'conv-123');
formData.append('userId', 'user-456');
formData.append('language', 'ar');

const response = await fetch('http://localhost:3001/api/rag/speech/voice-message', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('النص المُحوّل:', result.data.transcription.text);
console.log('رد المساعد:', result.data.message.content);
```

**استجابة ناجحة:**

```json
{
  "success": true,
  "data": {
    "transcription": {
      "text": "أريد الاستعلام عن المراسلة رقم 123",
      "language": "ar",
      "metadata": {
        "fileSize": 245760,
        "format": "mp3",
        "processingTime": 1234
      }
    },
    "message": {
      "id": "msg-789",
      "conversationId": "conv-123",
      "role": "assistant",
      "content": "المراسلة رقم 123 هي مراسلة واردة بتاريخ...",
      "sources": [...],
      "createdAt": "2025-01-15T10:30:05.000Z"
    }
  },
  "timestamp": "2025-01-15T10:30:05.000Z"
}
```

---

### 4. إرسال رسالة صوتية مع استجابة مباشرة (Streaming)

نفس الـ endpoint السابق لكن مع استجابة مباشرة (Server-Sent Events).

```
POST /api/rag/speech/voice-message/stream
```

**مثال مع EventSource:**

```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('conversationId', 'conv-123');
formData.append('userId', 'user-456');

const response = await fetch('http://localhost:3001/api/rag/speech/voice-message/stream', {
  method: 'POST',
  body: formData
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

      if (data.type === 'transcription') {
        console.log('النص:', data.text);
      } else if (data.type === 'token') {
        process.stdout.write(data.content);
      } else if (data.type === 'done') {
        console.log('\nانتهى الرد');
      }
    }
  }
}
```

---

### 5. الحصول على الصيغ المدعومة

```
GET /api/rag/speech/formats
```

**استجابة:**

```json
{
  "success": true,
  "data": {
    "formats": ["mp3", "wav", "ogg", "m4a", "webm", "flac"],
    "maxFileSize": 26214400,
    "maxFileSizeMB": 25,
    "maxDuration": 600,
    "maxDurationMinutes": 10
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### 6. كشف اللغة من ملف صوتي

```
POST /api/rag/speech/detect-language
```

**Body Parameters:**
- `audio` (file, required): الملف الصوتي

**استجابة:**

```json
{
  "success": true,
  "data": {
    "language": "ar",
    "filename": "audio.mp3"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## أمثلة عملية

### مثال 1: تطبيق ويب بسيط مع HTML + JavaScript

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>مساعد صوتي</title>
</head>
<body>
  <h1>المساعد الصوتي الذكي</h1>

  <div>
    <button id="recordBtn">ابدأ التسجيل</button>
    <button id="stopBtn" disabled>إيقاف التسجيل</button>
  </div>

  <div id="transcription"></div>
  <div id="response"></div>

  <script>
    let mediaRecorder;
    let audioChunks = [];

    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const transcriptionDiv = document.getElementById('transcription');
    const responseDiv = document.getElementById('response');

    recordBtn.onclick = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioChunks = [];

        await sendVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      recordBtn.disabled = true;
      stopBtn.disabled = false;
    };

    stopBtn.onclick = () => {
      mediaRecorder.stop();
      recordBtn.disabled = false;
      stopBtn.disabled = true;
    };

    async function sendVoiceMessage(audioBlob) {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('conversationId', 'your-conversation-id');
      formData.append('userId', 'your-user-id');
      formData.append('language', 'ar');

      transcriptionDiv.innerHTML = 'جاري التحويل...';
      responseDiv.innerHTML = '';

      try {
        const response = await fetch('http://localhost:3001/api/rag/speech/voice-message', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          transcriptionDiv.innerHTML = `<strong>أنت:</strong> ${result.data.transcription.text}`;
          responseDiv.innerHTML = `<strong>المساعد:</strong> ${result.data.message.content}`;
        } else {
          transcriptionDiv.innerHTML = `خطأ: ${result.error.message}`;
        }
      } catch (error) {
        transcriptionDiv.innerHTML = `خطأ: ${error.message}`;
      }
    }
  </script>
</body>
</html>
```

---

### مثال 2: استخدام مع React

```jsx
import React, { useState, useRef } from 'react';

function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        await sendVoiceMessage(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      alert('خطأ في الوصول للميكروفون: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    setLoading(true);
    setTranscription('');
    setResponse('');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('conversationId', 'your-conversation-id');
    formData.append('userId', 'your-user-id');
    formData.append('language', 'ar');

    try {
      const res = await fetch('http://localhost:3001/api/rag/speech/voice-message', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (result.success) {
        setTranscription(result.data.transcription.text);
        setResponse(result.data.message.content);
      } else {
        alert('خطأ: ' + result.error.message);
      }
    } catch (error) {
      alert('خطأ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voice-assistant">
      <h1>المساعد الصوتي الذكي</h1>

      <div className="controls">
        <button onClick={startRecording} disabled={isRecording || loading}>
          ابدأ التسجيل
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          إيقاف التسجيل
        </button>
      </div>

      {loading && <p>جاري المعالجة...</p>}

      {transcription && (
        <div className="transcription">
          <strong>أنت:</strong> {transcription}
        </div>
      )}

      {response && (
        <div className="response">
          <strong>المساعد:</strong> {response}
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;
```

---

## معالجة الأخطاء

### الأخطاء الشائعة

#### 1. `WHISPER_API_NOT_CONFIGURED`

**السبب**: Whisper API غير مُعدّ أو غير متاح
**الحل**: تأكد من تشغيل Whisper API وتحديث متغير `WHISPER_API_URL`

#### 2. `FILE_TOO_LARGE`

**السبب**: حجم الملف أكبر من الحد الأقصى
**الحل**: ضغط الملف أو استخدام صيغة أخرى

#### 3. `EMPTY_TRANSCRIPTION`

**السبب**: لم يتمكن النظام من تحويل الصوت أو الصوت فارغ
**الحل**: تحقق من جودة الصوت أو صيغة الملف

#### 4. `INVALID_FILE_TYPE`

**السبب**: صيغة الملف غير مدعومة
**الحل**: استخدم أحد الصيغ المدعومة (MP3, WAV, OGG, M4A, WEBM, FLAC)

---

## الحدود والقيود

| المتغير | القيمة الافتراضية | الوصف |
|---------|-------------------|-------|
| حجم الملف الأقصى | 25 MB | أقصى حجم للملف الصوتي |
| المدة القصوى | 10 دقائق | أقصى مدة للصوت |
| الصيغ المدعومة | MP3, WAV, OGG, M4A, WEBM, FLAC | صيغ الملفات الصوتية المدعومة |

---

## نصائح لأفضل أداء

1. **استخدم جودة صوت متوسطة**: جودة عالية جداً تزيد حجم الملف دون فائدة كبيرة
2. **تقليل الضوضاء**: سجل في بيئة هادئة للحصول على نتائج أفضل
3. **وضوح النطق**: تحدث بوضوح وبسرعة متوسطة
4. **استخدم الصيغ المضغوطة**: MP3 أو OGG أفضل من WAV للملفات الكبيرة
5. **اختبر اللغة المناسبة**: حدد اللغة صراحةً ('ar' أو 'en') بدلاً من 'auto' لنتائج أفضل

---

## الأسئلة الشائعة

### هل يمكن استخدام النظام بدون Whisper API؟

لا، النظام يتطلب Whisper API للعمل. يجب تثبيت وتشغيل Whisper.cpp أو خدمة مشابهة.

### هل يدعم النظام لغات أخرى غير العربية والإنجليزية؟

نعم، Whisper يدعم أكثر من 50 لغة، لكن النظام حالياً مُحسّن للعربية والإنجليزية.

### هل يتم حفظ الملفات الصوتية؟

يتم حفظ الملفات مؤقتاً في مجلد `uploads/audio` ويتم حذفها تلقائياً بعد 24 ساعة.

### هل يمكن استخدام Google Speech-to-Text بدلاً من Whisper؟

حالياً النظام مصمم للعمل مع Whisper API، لكن يمكن تعديل `SpeechToTextService` لدعم خدمات أخرى.

---

## الدعم الفني

للإبلاغ عن مشاكل أو طلب ميزات جديدة، يُرجى فتح Issue في المستودع على GitHub.
