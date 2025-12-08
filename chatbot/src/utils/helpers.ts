import { IMessage } from '../models/Message';

/**
 * تحويل رسائل المحادثة إلى تنسيق Ollama API
 */
export const formatMessagesForOllama = (messages: IMessage[]): Array<{
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
}> => {
  return messages.map((msg) => {
    const formatted: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      images?: string[];
    } = {
      role: msg.role,
      content: msg.content,
    };

    // إضافة الصور إذا كانت موجودة
    const imageAttachments = msg.attachments.filter((att) => att.type === 'image');
    if (imageAttachments.length > 0) {
      // Ollama يتوقع base64 بدون prefix (data:image/jpeg;base64,)
      formatted.images = imageAttachments.map((att) => {
        // إزالة prefix إذا كان موجوداً
        if (att.base64Data.includes(',')) {
          return att.base64Data.split(',')[1];
        }
        return att.base64Data;
      });
    }

    return formatted;
  });
};

/**
 * تنسيق رسالة خطأ للمستخدم
 */
export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'حدث خطأ غير متوقع';
};

