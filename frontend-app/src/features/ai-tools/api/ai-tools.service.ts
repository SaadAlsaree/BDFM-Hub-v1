import axios from 'axios';
import { getSession } from 'next-auth/react';
import {
  OCRRequestPayload,
  OCRResponse,
  OCRStreamingChunk
} from '../types/ai-tools';

const CHATBOT_API_URL =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:5005';

// إنشاء axios instance منفصل للـ chatbot API (client side)
const chatbotClient = axios.create({
  baseURL: CHATBOT_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 1200000 // 20 minutes for OCR processing
});

// إضافة interceptor لإضافة token من session
chatbotClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } catch (error) {
      console.error('Error getting session for chatbot client:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * OCR Service - خدمة OCR للتعامل مع API
 */
export const ocrService = {
  /**
   * تنفيذ OCR على الصور (non-streaming) - Server Side
   * @param payload بيانات الطلب
   * @returns استجابة OCR
   */
  async performOCR(payload: OCRRequestPayload): Promise<OCRResponse | null> {
    try {
      // إنشاء axios instance للـ server side مع baseURL للـ chatbot
      const serverChatbotClient = axios.create({
        baseURL: CHATBOT_API_URL,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        timeout: 120000
      });

      const response = await serverChatbotClient.post<OCRResponse>(
        '/api/ocr',
        payload
      );

      if (response.status >= 400) {
        console.error('Error performing OCR:', response.statusText);
        return null;
      }

      return response.data;
    } catch (error: any) {
      console.error('Error performing OCR:', error);

      // معالجة الأخطاء من API
      if (error.response?.data) {
        return error.response.data as unknown as OCRResponse;
      }

      return null;
    }
  },

  /**
   * تنفيذ OCR على الصور (non-streaming) - Client Side
   * @param payload بيانات الطلب
   * @returns استجابة OCR
   */
  async performOCRClient(
    payload: OCRRequestPayload
  ): Promise<OCRResponse | null> {
    try {
      const response = await chatbotClient.post<OCRResponse>(
        '/api/ocr',
        payload
      );

      if (response.status >= 400) {
        console.error('Error performing OCR:', response.statusText);
        return null;
      }

      return response.data;
    } catch (error: any) {
      console.error('Error performing OCR:', error);

      // معالجة الأخطاء من API - إرجاع تفاصيل الخطأ
      if (error.response?.data) {
        const errorData = error.response.data;

        // إذا كان الخطأ يحتوي على معلومات مفيدة، أعدها
        if (typeof errorData === 'object' && errorData !== null) {
          return {
            success: false,
            data: {
              text: '',
              model: payload.model
            },
            message:
              errorData.message || errorData.error || 'حدث خطأ في السيرفر',
            error: errorData
          } as OCRResponse;
        }

        return errorData as unknown as OCRResponse;
      }

      // إذا لم يكن هناك response data، أعد خطأ عام
      return {
        success: false,
        data: {
          text: '',
          model: payload.model
        },
        message:
          error.message ||
          `خطأ في الاتصال: ${error.response?.status || 'غير معروف'}`,
        error: error
      } as OCRResponse;
    }
  },

  /**
   * تنفيذ OCR على الصور مع streaming
   * @param payload بيانات الطلب
   * @param onChunk callback يتم استدعاؤه عند وصول chunk جديد
   * @param onError callback يتم استدعاؤه عند حدوث خطأ
   * @param onComplete callback يتم استدعاؤه عند اكتمال الستريمنج
   */
  async performOCRStreaming(
    payload: OCRRequestPayload,
    onChunk: (chunk: OCRStreamingChunk) => void,
    onError?: (error: Error) => void,
    onComplete?: (fullText: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6)) as OCRStreamingChunk;

              if (data.response) {
                fullText += data.response;
                onChunk(data);
              }

              if (data.done) {
                if (onComplete) {
                  onComplete(fullText);
                }
                return;
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.warn('Error parsing SSE chunk:', parseError);
            }
          }
        }
      }

      if (onComplete) {
        onComplete(fullText);
      }
    } catch (error: any) {
      console.error('Error in OCR streaming:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  },

  /**
   * تحويل File إلى base64 string
   * @param file ملف الصورة
   * @returns Promise<string> base64 encoded string
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        // إزالة data URL prefix إذا كان موجوداً
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * تحويل multiple files إلى base64 strings
   * @param files مصفوفة من الملفات
   * @returns Promise<string[]> مصفوفة من base64 encoded strings
   */
  async filesToBase64(files: File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.fileToBase64(file)));
  }
};
