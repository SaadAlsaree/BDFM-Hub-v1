import { Response, NextFunction } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/auth.middleware";
import { getOllamaUrl, ollamaConfig } from "../config/ollama";

/**
 * تنفيذ OCR على الصور باستخدام Ollama
 */
export const performOCR = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "غير مصرح",
      });
      return;
    }

    const { model, prompt, images, stream } = req.body;

    // التحقق من الحقول المطلوبة
    if (!model) {
      res.status(400).json({
        success: false,
        message: "اسم الموديل مطلوب",
      });
      return;
    }

    if (!prompt) {
      res.status(400).json({
        success: false,
        message: "النص المطلوب (prompt) مطلوب",
      });
      return;
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      res.status(400).json({
        success: false,
        message: "يجب إرسال صورة واحدة على الأقل",
      });
      return;
    }

    // stream اختياري، افتراضي false
    const useStream = stream === true || stream === "true";

    // تنظيف base64 strings - إزالة prefix إذا كان موجوداً
    const cleanedImages = images.map((img: string) => {
      if (img.includes(",")) {
        return img.split(",")[1];
      }
      return img;
    });

    // إعداد طلب Ollama
    const ollamaUrl = getOllamaUrl("/api/generate");
    const requestBody = {
      model,
      prompt,
      images: cleanedImages,
      stream: useStream,
    };

    // إذا كان streaming مفعّل
    if (useStream) {
      try {
        // Logging للـ debugging في وضع التطوير
        if (process.env.NODE_ENV === "development") {
          console.log("📤 إرسال طلب OCR streaming لـ Ollama:", {
            url: ollamaUrl,
            model,
            imagesCount: cleanedImages.length,
          });
        }

        // إعداد Server-Sent Events
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // تعطيل buffering في nginx

        // إرسال طلب streaming لـ Ollama
        const ollamaResponse = await axios.post(ollamaUrl, requestBody, {
          timeout: ollamaConfig.timeout,
          responseType: "stream",
        });

        let fullResponse = "";

        // معالجة الـ stream
        ollamaResponse.data.on("data", (chunk: Buffer) => {
          const lines = chunk.toString().split("\n");

          for (const line of lines) {
            if (line.trim() === "") continue;

            try {
              const data = JSON.parse(line);

              // Ollama generate API يستخدم "response" بدلاً من "message.content"
              if (data.response) {
                const content = data.response;
                fullResponse += content;

                // إرسال chunk للمستخدم
                res.write(
                  `data: ${JSON.stringify({ response: content, done: data.done || false })}\n\n`
                );
              }

              if (data.done) {
                // إرسال إشارة الانتهاء
                res.write(
                  `data: ${JSON.stringify({ done: true, response: fullResponse })}\n\n`
                );
                res.end();
                return;
              }
            } catch (parseError) {
              // تجاهل خطأ parsing للأسطر الفارغة
              if (line.trim() !== "") {
                console.error("خطأ في parsing chunk:", parseError);
              }
            }
          }
        });

        ollamaResponse.data.on("error", (error: Error) => {
          console.error("خطأ في stream:", error);
          res.write(
            `data: ${JSON.stringify({ error: "خطأ في الستريمنج" })}\n\n`
          );
          res.end();
        });

        return; // لا نتابع الكود العادي في حالة streaming
      } catch (error: unknown) {
        // معالجة الأخطاء في streaming
        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNREFUSED") {
            res.write(
              `data: ${JSON.stringify({ error: "لا يمكن الاتصال بـ Ollama" })}\n\n`
            );
            res.end();
            return;
          }
        }
        res.write(
          `data: ${JSON.stringify({ error: "خطأ في الستريمنج" })}\n\n`
        );
        res.end();
        return;
      }
    }

    // الكود العادي (non-streaming)
    try {
      // Logging للـ debugging في وضع التطوير
      if (process.env.NODE_ENV === "development") {
        console.log("📤 إرسال طلب OCR لـ Ollama:", {
          url: ollamaUrl,
          model,
          imagesCount: cleanedImages.length,
        });
      }

      const ollamaResponse = await axios.post(ollamaUrl, requestBody, {
        timeout: ollamaConfig.timeout,
      });

      // Ollama generate API يستخدم "response" بدلاً من "message.content"
      const ocrText = ollamaResponse.data.response || "لم يتم الحصول على نص";

      res.json({
        success: true,
        data: {
          text: ocrText,
          model,
        },
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Logging تفصيلي للخطأ
        if (process.env.NODE_ENV === "development") {
          console.error("❌ خطأ Ollama:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
          });
        }

        if (error.code === "ECONNREFUSED") {
          res.status(503).json({
            success: false,
            message:
              "لا يمكن الاتصال بـ Ollama. تأكد من تشغيل Ollama على localhost:11434",
          });
          return;
        }

        // معالجة خطأ 400 (Bad Request)
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.error || "طلب غير صحيح";
          res.status(400).json({
            success: false,
            message: `خطأ في طلب Ollama: ${errorMessage}`,
            error:
              process.env.NODE_ENV === "development"
                ? {
                    status: error.response.status,
                    data: error.response.data,
                    model,
                  }
                : undefined,
          });
          return;
        }

        res.status(500).json({
          success: false,
          message: "خطأ في الاتصال بـ Ollama",
          error:
            process.env.NODE_ENV === "development"
              ? {
                  message: error.message,
                  status: error.response?.status,
                  data: error.response?.data,
                }
              : undefined,
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

