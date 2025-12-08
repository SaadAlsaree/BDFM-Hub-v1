import { Response, NextFunction } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/auth.middleware";
import { getOllamaUrl, ollamaConfig } from "../config/ollama";

/**
 * جلب قائمة الموديلات المتاحة من Ollama
 */
export const getModels = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const url = getOllamaUrl("/api/tags");

    const response = await axios.get(url, {
      timeout: ollamaConfig.timeout,
    });

    const models = response.data.models || [];

    res.json({
      success: true,
      data: {
        models: models.map((model: { name: string; modified_at: string }) => ({
          name: model.name,
          modifiedAt: model.modified_at,
        })),
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNREFUSED") {
        res.status(503).json({
          success: false,
          message:
            "لا يمكن الاتصال بـ Ollama. تأكد من تشغيل Ollama على localhost:11434",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "خطأ في الاتصال بـ Ollama",
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      });
      return;
    }

    next(error);
  }
};
