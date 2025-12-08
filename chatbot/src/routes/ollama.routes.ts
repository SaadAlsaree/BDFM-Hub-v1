import { Router } from 'express';
import { getModels } from '../controllers/ollama.controller';
import { extractUserFromBody } from '../middleware/auth.middleware';

const router = Router();

// جميع routes تحتاج استخراج بيانات المستخدم من body
router.use(extractUserFromBody);

// GET /api/ollama/models
router.get('/models', getModels);

export default router;

