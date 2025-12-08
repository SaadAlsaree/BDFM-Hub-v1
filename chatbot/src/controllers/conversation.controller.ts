import { Response, NextFunction } from 'express';
import Conversation from '../models/Conversation';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler.middleware';

/**
 * جلب كل محادثات المستخدم مع pagination
 */
export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('غير مصرح', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-messages'); // عدم جلب الرسائل في القائمة

    const total = await Conversation.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * إنشاء محادثة جديدة
 */
export const createConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('غير مصرح', 401);
    }

    const { modelName, title } = req.body;

    const conversation = await Conversation.create({
      userId: req.user.id,
      modelName: modelName || undefined, // اختياري - الموديل يحدد عند إرسال الرسالة
      title: title || 'محادثة جديدة',
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المحادثة بنجاح',
      data: {
        conversation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * جلب محادثة محددة مع رسائلها
 */
export const getConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('غير مصرح', 401);
    }

    const { id } = req.params;

    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        conversation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * تحديث عنوان المحادثة
 */
export const updateConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('غير مصرح', 401);
    }

    const { id } = req.params;
    const { title } = req.body;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { title },
      { new: true, runValidators: true }
    );

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة',
      });
      return;
    }

    res.json({
      success: true,
      message: 'تم تحديث المحادثة بنجاح',
      data: {
        conversation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * حذف محادثة
 */
export const deleteConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('غير مصرح', 401);
    }

    const { id } = req.params;

    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة',
      });
      return;
    }

    res.json({
      success: true,
      message: 'تم حذف المحادثة بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

