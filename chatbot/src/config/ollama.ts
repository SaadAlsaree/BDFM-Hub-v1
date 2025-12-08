/**
 * إعدادات Ollama
 */
export const ollamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  keepAlive: 0, // عزل المستخدمين - لا نحتفظ بالسياق في Ollama
  timeout: 500000, // 5 دقائق timeout
};

/**
 * بناء URL كامل لـ endpoint معين
 */
export const getOllamaUrl = (endpoint: string): string => {
  const baseUrl = ollamaConfig.baseUrl.replace(/\/$/, ""); // إزالة / في النهاية إن وجد
  const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${endpointPath}`;
};
