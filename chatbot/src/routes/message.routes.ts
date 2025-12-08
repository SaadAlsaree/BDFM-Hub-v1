import { Router } from 'express';
import { validationResult } from 'express-validator';
import {
  sendMessage,
  getMessages,
} from '../controllers/message.controller';
import { extractUserFromBody } from '../middleware/auth.middleware';
import { uploadMultiple } from '../middleware/upload.middleware';
import { validateSendMessage } from '../utils/validation';

const router = Router();

// جميع routes تحتاج استخراج بيانات المستخدم من body
router.use(extractUserFromBody);

// Middleware للتحقق من validation errors
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'خطأ في البيانات المدخلة',
      errors: errors.array(),
    });
  }
  next();
};

// POST /api/conversations/:conversationId/messages
router.post(
  '/:conversationId/messages',
  uploadMultiple,
  validateSendMessage,
  handleValidationErrors,
  sendMessage
);

// GET /api/conversations/:conversationId/messages
router.get('/:conversationId/messages', getMessages);

export default router;

