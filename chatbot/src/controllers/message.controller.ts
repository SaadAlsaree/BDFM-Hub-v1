import { Response, NextFunction } from "express";
import axios from "axios";
import Conversation from "../models/Conversation";
import { AuthRequest } from "../middleware/auth.middleware";
import { createError } from "../middleware/errorHandler.middleware";
import { getOllamaUrl, ollamaConfig } from "../config/ollama";
import { formatMessagesForOllama } from "../utils/helpers";
import { createAttachment } from "../middleware/upload.middleware";

/**
 * إرسال رسالة جديدة والحصول على رد من Ollama
 */
export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError("غير مصرح", 401);
    }

    const { conversationId } = req.params;
    const { content, modelName, stream } = req.body;
    
    // stream اختياري، افتراضي false
    const useStream = stream === true || stream === "true";

    // التحقق من وجود modelName
    if (!modelName) {
      res.status(400).json({
        success: false,
        message: "اسم الموديل مطلوب",
      });
      return;
    }

    // معالجة الملفات - req.files يمكن أن يكون array أو object
    let files: Express.Multer.File[] = [];
    if (req.files) {
      if (Array.isArray(req.files)) {
        files = req.files;
      } else {
        // إذا كان object، نجمع كل الملفات في array واحد
        files = Object.values(req.files).flat();
      }
    }

    // جلب المحادثة
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id,
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "المحادثة غير موجودة",
      });
      return;
    }

    // معالجة المرفقات
    const attachments = files ? files.map(createAttachment) : [];

    // إضافة رسالة المستخدم
    const userMessage = {
      role: "user" as const,
      content: content || "",
      attachments,
      modelName, // حفظ الموديل المستخدم
      createdAt: new Date(),
    };

    conversation.messages.push(userMessage);
    await conversation.save();

    // بناء session كامل من رسائل المحادثة
    const allMessages = conversation.messages;
    const formattedMessages = formatMessagesForOllama(allMessages);

    // إرسال الطلب لـ Ollama
    const ollamaUrl = getOllamaUrl("/api/chat");
    const requestBody = {
      model: modelName, // استخدام الموديل المحدد في الرسالة
      messages: formattedMessages,
      stream: useStream,
      keep_alive: ollamaConfig.keepAlive,
    };

    let assistantResponse: string;
    
    // إذا كان streaming مفعّل
    if (useStream) {
      try {
        // Logging للـ debugging في وضع التطوير
        if (process.env.NODE_ENV === "development") {
          console.log("📤 إرسال طلب streaming لـ Ollama:", {
            url: ollamaUrl,
            model: modelName,
            messagesCount: formattedMessages.length,
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
              
              if (data.message?.content) {
                const content = data.message.content;
                fullResponse += content;
                
                // إرسال chunk للمستخدم
                res.write(`data: ${JSON.stringify({ content, done: data.done || false })}\n\n`);
              }
              
              if (data.done) {
                // حفظ الرسالة الكاملة في قاعدة البيانات
                const assistantMessage = {
                  role: "assistant" as const,
                  content: fullResponse,
                  attachments: [],
                  modelName,
                  createdAt: new Date(),
                };

                conversation.messages.push(assistantMessage);
                conversation.updatedAt = new Date();
                conversation.save().catch((err) => {
                  console.error("خطأ في حفظ الرسالة:", err);
                });

                // إرسال إشارة الانتهاء
                res.write(`data: ${JSON.stringify({ done: true, fullMessage: assistantMessage })}\n\n`);
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
          res.write(`data: ${JSON.stringify({ error: "خطأ في الستريمنج" })}\n\n`);
          res.end();
        });

        return; // لا نتابع الكود العادي في حالة streaming
      } catch (error: unknown) {
        // معالجة الأخطاء في streaming
        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNREFUSED") {
            res.write(`data: ${JSON.stringify({ error: "لا يمكن الاتصال بـ Ollama" })}\n\n`);
            res.end();
            return;
          }
        }
        res.write(`data: ${JSON.stringify({ error: "خطأ في الستريمنج" })}\n\n`);
        res.end();
        return;
      }
    }

    // الكود العادي (non-streaming)
    try {
      // Logging للـ debugging في وضع التطوير
      if (process.env.NODE_ENV === "development") {
        console.log("📤 إرسال طلب لـ Ollama:", {
          url: ollamaUrl,
          model: modelName,
          messagesCount: formattedMessages.length,
        });
      }

      const ollamaResponse = await axios.post(ollamaUrl, requestBody, {
        timeout: ollamaConfig.timeout,
      });

      assistantResponse =
        ollamaResponse.data.message?.content || "لم يتم الحصول على رد";
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
                    model: modelName,
                  }
                : undefined,
          });
          return;
        }

        // في حالة فشل الاتصال، نحفظ رسالة المستخدم فقط
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

    // إضافة رد AI
    const assistantMessage = {
      role: "assistant" as const,
      content: assistantResponse,
      attachments: [],
      modelName, // حفظ الموديل المستخدم
      createdAt: new Date(),
    };

    conversation.messages.push(assistantMessage);
    await conversation.save();

    // تحديث updatedAt للمحادثة
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      success: true,
      message: "تم إرسال الرسالة بنجاح",
      data: {
        message: assistantMessage,
        conversationId: conversation._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * جلب رسائل محادثة محددة
 */
export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError("غير مصرح", 401);
    }

    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id,
    }).select("messages");

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "المحادثة غير موجودة",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        messages: conversation.messages,
      },
    });
  } catch (error) {
    next(error);
  }
};
