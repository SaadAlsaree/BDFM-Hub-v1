import multer from 'multer';
import config from '../config';
import logger from '../utils/logger';
import path from 'path';

/**
 * Multer configuration for audio file uploads
 */

// Storage configuration (memory storage for processing)
const storage = multer.memoryStorage();

// File filter to allow only audio files
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = config.speech.supportedFormats.map(
    (format) => `.${format}`
  );
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`
      )
    );
  }
};

// Multer instance for audio uploads
export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.speech.maxFileSize,
  },
});

// Error handler for multer errors
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: `File too large. Maximum size is ${config.speech.maxFileSize / 1024 / 1024}MB`,
          code: 'FILE_TOO_LARGE',
        },
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(400).json({
      success: false,
      error: {
        message: error.message,
        code: 'UPLOAD_ERROR',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (error) {
    logger.error('Upload error:', error);
    return res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Failed to upload file',
        code: 'UPLOAD_ERROR',
      },
      timestamp: new Date().toISOString(),
    });
  }

  next();
};
