// تحميل متغيرات البيئة أولاً
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = process.env.PORT || 5005;

// بدء السيرفر
const startServer = async (): Promise<void> => {
  try {
    // الاتصال بقاعدة البيانات
    await connectDatabase();

    // بدء السيرفر
    app.listen(PORT, () => {
      console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
      console.log(`📍 البيئة: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ فشل بدء السيرفر:", error);
    process.exit(1);
  }
};

startServer();
