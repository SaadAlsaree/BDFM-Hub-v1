import { Schema } from 'mongoose';

export interface IAttachment {
  type: 'image' | 'pdf' | 'document';
  filename: string;
  mimeType: string;
  size: number;
  base64Data: string;
  url?: string;
}

export const AttachmentSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['image', 'pdf', 'document'],
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    base64Data: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

