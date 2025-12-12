import mongoose, { Schema } from "mongoose";
const ChatPairSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });
const ChatSchema = new Schema({
    documentId: { type: String, unique: true, index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false }, // only for logged in users
    chats: { type: [ChatPairSchema], default: [] },
}, { timestamps: true });
export const ChatMessage = mongoose.models.ChatMessage ||
    mongoose.model("ChatMessage", ChatSchema);
//# sourceMappingURL=ChatMessage.js.map