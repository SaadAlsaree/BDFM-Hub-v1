import { Schema } from 'mongoose';
import { AttachmentSchema, IAttachment } from './Attachment';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments: IAttachment[];
  modelName?: string; // الموديل المستخدم لهذه الرسالة
  createdAt: Date;
}

export const MessageSchema: Schema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    modelName: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

