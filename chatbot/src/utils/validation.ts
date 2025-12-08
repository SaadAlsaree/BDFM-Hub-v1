import { body, ValidationChain } from 'express-validator';

/**
 * قواعد التحقق من إنشاء محادثة
 */
export const validateCreateConversation: ValidationChain[] = [
  body('modelName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم الموديل يجب أن يكون أقل من 100 حرف'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('العنوان يجب أن يكون أقل من 200 حرف'),
];

/**
 * قواعد التحقق من تحديث عنوان المحادثة
 */
export const validateUpdateConversation: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('العنوان مطلوب')
    .isLength({ max: 200 })
    .withMessage('العنوان يجب أن يكون أقل من 200 حرف'),
];

/**
 * قواعد التحقق من إرسال رسالة
 */
export const validateSendMessage: ValidationChain[] = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('محتوى الرسالة مطلوب')
    .isLength({ max: 10000 })
    .withMessage('محتوى الرسالة يجب أن يكون أقل من 10000 حرف'),
  body('modelName')
    .trim()
    .notEmpty()
    .withMessage('اسم الموديل مطلوب'),
  body('stream')
    .optional()
    .isBoolean()
    .withMessage('stream يجب أن يكون true أو false'),
];

/**
 * قواعد التحقق من طلب OCR
 */
export const validateOCR: ValidationChain[] = [
  body('model')
    .trim()
    .notEmpty()
    .withMessage('اسم الموديل مطلوب')
    .isLength({ max: 100 })
    .withMessage('اسم الموديل يجب أن يكون أقل من 100 حرف'),
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('النص المطلوب (prompt) مطلوب')
    .isLength({ max: 1000 })
    .withMessage('النص المطلوب يجب أن يكون أقل من 1000 حرف'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('يجب إرسال صورة واحدة على الأقل')
    .custom((images) => {
      if (!Array.isArray(images)) {
        throw new Error('images يجب أن يكون مصفوفة');
      }
      for (const img of images) {
        if (typeof img !== 'string' || img.trim() === '') {
          throw new Error('كل صورة يجب أن تكون نص base64 صحيح');
        }
      }
      return true;
    }),
  body('stream')
    .optional()
    .isBoolean()
    .withMessage('stream يجب أن يكون true أو false'),
];

