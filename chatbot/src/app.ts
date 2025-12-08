import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.middleware";

// Routes
import ollamaRoutes from "./routes/ollama.routes";
import conversationRoutes from "./routes/conversation.routes";
import messageRoutes from "./routes/message.routes";
import attachmentRoutes from "./routes/attachment.routes";
import ocrRoutes from "./routes/ocr.routes";

// تحميل متغيرات البيئة
dotenv.config();

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: "تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً",
});

app.use("/api/", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/ollama", ollamaRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/conversations", messageRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/ocr", ocrRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "المسار غير موجود",
  });
});

// Error handler (يجب أن يكون آخر middleware)
app.use(errorHandler);

export default app;
