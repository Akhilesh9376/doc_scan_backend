import mongoose, { Schema, Document, Types } from "mongoose";

interface IChatPair {
  question: string;
  answer: string;
  createdAt: Date;
}

export interface IChatDoc extends Document {
  documentId: string;
  userId?: Types.ObjectId | string; // logged-in only
  chats: IChatPair[];
}

const ChatPairSchema = new Schema<IChatPair>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSchema = new Schema<IChatDoc>(
  {
    documentId: { type: String, unique: true, index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false }, // only for logged in users
    chats: { type: [ChatPairSchema], default: [] },
  },
  { timestamps: true }
);

export const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatDoc>("ChatMessage", ChatSchema);
