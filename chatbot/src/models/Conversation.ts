import mongoose, { Document, Schema } from 'mongoose';
import { MessageSchema, IMessage } from './Message';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  modelName?: string; // الموديل الافتراضي (اختياري)
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب'],
      index: true,
    },
    title: {
      type: String,
      default: 'محادثة جديدة',
      trim: true,
    },
    modelName: {
      type: String,
      required: false, // أصبح اختياري - الموديل يحدد عند إرسال الرسالة
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index على userId للبحث السريع
ConversationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);

