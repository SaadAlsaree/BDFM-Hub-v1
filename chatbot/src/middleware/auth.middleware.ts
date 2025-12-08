import { Request, Response, NextFunction } from "express";

// توسيع Request interface لإضافة user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    userLogin: string;
    fullName: string;
    email: string;
    organizationalUnitId: string;
  };
}

/**
 * Middleware لاستخراج بيانات المستخدم من body الطلب (للـ POST/PUT/PATCH) أو query parameters (للـ GET)
 */
export const extractUserFromBody = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // للـ GET requests، نستخدم query parameters، للـ POST/PUT/PATCH نستخدم body
    const source = req.method === 'GET' ? req.query : req.body;
    
    const id = source.id as string;
    const username = source.username as string;
    const userLogin = source.userLogin as string;
    const fullName = source.fullName as string;
    const email = source.email as string;
    const organizationalUnitId = source.organizationalUnitId as string;

    // التحقق من وجود جميع الحقول المطلوبة
    if (!id || !username || !userLogin || !fullName || !email || !organizationalUnitId) {
      res.status(400).json({
        success: false,
        message: "بيانات المستخدم غير مكتملة. يجب توفير: id, username, userLogin, fullName, email, organizationalUnitId",
      });
      return;
    }

    // وضع بيانات المستخدم في req.user
    req.user = {
      id,
      username,
      userLogin,
      fullName,
      email,
      organizationalUnitId,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في استخراج بيانات المستخدم",
    });
  }
};
