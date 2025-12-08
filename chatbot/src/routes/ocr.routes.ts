import { Router, Request, Response, NextFunction } from 'express';
import { performOCR } from '../controllers/ocr.controller';
import { extractUserFromBody } from '../middleware/auth.middleware';
import { validateOCR } from '../utils/validation';
import { validationResult } from 'express-validator';

const router = Router();

// جميع routes تحتاج استخراج بيانات المستخدم من body
router.use(extractUserFromBody);

// Middleware للتحقق من validation errors
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'خطأ في التحقق من البيانات',
      errors: errors.array(),
    });
    return;
  }
  next();
};

// POST /api/ocr - تنفيذ OCR على الصور
router.post('/', validateOCR, handleValidationErrors, performOCR);

export default router;

