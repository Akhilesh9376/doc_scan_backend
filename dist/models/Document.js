import mongoose from "mongoose";
const documentSchema = new mongoose.Schema({
    documentId: {
        type: String,
        unique: true,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // null for guest uploads
    },
    name: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    cloudinaryPublicId: {
        type: String,
        required: false,
    },
    cloudinaryUrl: {
        type: String,
        required: false,
    },
    // TODO: CLOUDINARY INTEGRATION
    // ==================================================
    // After implementing Cloudinary file upload:
    // cloudinaryPublicId: String,
    // cloudinaryUrl: String,
    // localPath: String (for temporary local storage)
    // ==================================================
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    analyzed: {
        type: Boolean,
        default: false,
    },
    analysisStatus: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
    },
}, {
    timestamps: true,
});
export const Document = mongoose.model("Document", documentSchema);
//# sourceMappingURL=Document.js.map