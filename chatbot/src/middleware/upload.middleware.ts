import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// أنواع الملفات المسموحة
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5; // حد أقصى 5 ملفات

/**
 * تحديد نوع الملف بناءً على MIME type
 */
const getFileType = (mimeType: string): "image" | "pdf" | "document" => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType === "application/pdf") {
    return "pdf";
  }
  return "document";
};

/**
 * Filter للتحقق من نوع الملف
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `نوع الملف غير مسموح. الأنواع المسموحة: ${ALLOWED_MIME_TYPES.join(
          ", "
        )}`
      )
    );
  }
};

/**
 * إعداد Multer
 */
const storage = multer.memoryStorage(); // حفظ الملفات في الذاكرة

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

/**
 * Middleware لرفع ملفات متعددة
 */
export const uploadMultiple = upload.array("attachments", MAX_FILES);

/**
 * Helper function لتحويل Buffer إلى base64
 */
export const bufferToBase64 = (buffer: Buffer, mimeType: string): string => {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

/**
 * Helper function لإنشاء attachment object
 */
export const createAttachment = (
  file: Express.Multer.File
): {
  type: "image" | "pdf" | "document";
  filename: string;
  mimeType: string;
  size: number;
  base64Data: string;
} => {
  return {
    type: getFileType(file.mimetype),
    filename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    base64Data: bufferToBase64(file.buffer, file.mimetype),
  };
};
