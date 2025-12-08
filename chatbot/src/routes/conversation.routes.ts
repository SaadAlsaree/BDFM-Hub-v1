import { Router } from 'express';
import { validationResult } from 'express-validator';
import {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
} from '../controllers/conversation.controller';
import { extractUserFromBody } from '../middleware/auth.middleware';
import {
  validateCreateConversation,
  validateUpdateConversation,
} from '../utils/validation';

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

// GET /api/conversations
router.get('/', getConversations);

// POST /api/conversations
router.post(
  '/',
  validateCreateConversation,
  handleValidationErrors,
  createConversation
);

// GET /api/conversations/:id
router.get('/:id', getConversation);

// PUT /api/conversations/:id
router.put(
  '/:id',
  validateUpdateConversation,
  handleValidationErrors,
  updateConversation
);

// DELETE /api/conversations/:id
router.delete('/:id', deleteConversation);

export default router;

