/**
 * User data interface - بيانات المستخدم المطلوبة في كل طلب
 */
export interface OCRUserData {
  id: string;
  username: string;
  userLogin: string;
  fullName: string;
  email: string;
  organizationalUnitId: string;
}

/**
 * OCR Request Payload - بيانات طلب OCR
 */
export interface OCRRequestPayload extends OCRUserData {
  model: string;
  prompt: string;
  images: string[]; // Array of base64 encoded images
  stream?: boolean;
}

/**
 * OCR Response - استجابة OCR (non-streaming)
 */
export interface OCRResponse {
  success: boolean;
  data: {
    text: string;
    model: string;
  };
  message?: string;
  error?: any;
}

/**
 * OCR Streaming Chunk - جزء من استجابة الستريمنج
 */
export interface OCRStreamingChunk {
  response?: string;
  done?: boolean;
  error?: string;
}

/**
 * OCR Error Response - استجابة الخطأ
 */
export interface OCRErrorResponse {
  success: false;
  message: string;
  error?: any;
}
