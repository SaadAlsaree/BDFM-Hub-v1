import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

/**
 * Middleware لمعالجة الأخطاء بشكل مركزي
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // Logging الخطأ
  console.error("❌ خطأ:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    status,
    message: err.message || "حدث خطأ غير متوقع",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * إنشاء AppError مخصص
 */
export const createError = (
  message: string,
  statusCode: number = 500
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
  return error;
};
