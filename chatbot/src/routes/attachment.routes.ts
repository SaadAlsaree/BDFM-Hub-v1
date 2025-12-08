import { Router } from 'express';
import Conversation from '../models/Conversation';
import { extractUserFromBody, AuthRequest } from '../middleware/auth.middleware';
import { Response, NextFunction } from 'express';

const router = Router();

// جميع routes تحتاج استخراج بيانات المستخدم من body
router.use(extractUserFromBody);

/**
 * GET /api/attachments/:conversationId/:messageIndex/:attachmentIndex
 * جلب مرفق محدد
 */
router.get(
  '/:conversationId/:messageIndex/:attachmentIndex',
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'غير مصرح',
        });
        return;
      }

      const { conversationId, messageIndex, attachmentIndex } = req.params;
      const msgIndex = parseInt(messageIndex);
      const attIndex = parseInt(attachmentIndex);

      if (isNaN(msgIndex) || isNaN(attIndex)) {
        res.status(400).json({
          success: false,
          message: 'فهرس الرسالة أو المرفق غير صحيح',
        });
        return;
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId: req.user.id,
      });

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'المحادثة غير موجودة',
        });
        return;
      }

      const message = conversation.messages[msgIndex];
      if (!message) {
        res.status(404).json({
          success: false,
          message: 'الرسالة غير موجودة',
        });
        return;
      }

      const attachment = message.attachments[attIndex];
      if (!attachment) {
        res.status(404).json({
          success: false,
          message: 'المرفق غير موجود',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          attachment,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

