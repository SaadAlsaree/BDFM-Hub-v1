import mongoose from "mongoose";

/**
 * الاتصال بقاعدة بيانات MongoDB
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    let mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ollama-chatbot";

    if (!mongoUri) {
      throw new Error("MONGODB_URI غير موجود في متغيرات البيئة");
    }

    // إذا كان URI يحتوي على @ (يعني فيه authentication) ولا يحتوي على authSource
    // وكان المستخدم admin، أضف authSource=admin تلقائياً
    if (
      mongoUri.includes("@") &&
      !mongoUri.includes("authSource") &&
      mongoUri.includes("admin:")
    ) {
      // إضافة authSource=admin إذا لم يكن موجوداً
      const separator = mongoUri.includes("?") ? "&" : "?";
      mongoUri = `${mongoUri}${separator}authSource=admin`;
      console.log("🔧 تم إضافة authSource=admin تلقائياً");
    }

    // خيارات الاتصال
    const options: mongoose.ConnectOptions = {};

    await mongoose.connect(mongoUri, options);

    console.log("✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح");

    // معالجة أخطاء الاتصال
    mongoose.connection.on("error", (err) => {
      console.error("❌ خطأ في اتصال MongoDB:", err);

      // رسائل خطأ أوضح
      if (err.message.includes("authentication")) {
        console.error(
          "💡 تلميح: تأكد من إضافة username و password في MONGODB_URI:\n" +
          "   MONGODB_URI=mongodb://username:password@localhost:27017/ollama-chatbot"
        );
      }
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ تم قطع الاتصال مع MongoDB");
    });

    // إغلاق الاتصال عند إغلاق التطبيق
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("تم إغلاق اتصال MongoDB");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", error);

    // رسائل خطأ أوضح
    if (error instanceof Error) {
      if (error.message.includes("authentication") || error.message.includes("Authentication")) {
        console.error(
          "\n💡 حل مشكلة Authentication:\n" +
          "   1. تأكد من صحة username و password في MONGODB_URI\n" +
          "   2. إذا كان المستخدم root، جرب إضافة authSource=admin:\n" +
          "      MONGODB_URI=mongodb://admin:AdminSaad@localhost:27017/ollama-chatbot?authSource=admin\n" +
          "   3. أو استخدم database admin للاتصال:\n" +
          "      MONGODB_URI=mongodb://admin:AdminSaad@localhost:27017/admin"
        );
      }
    }

    process.exit(1);
  }
};

