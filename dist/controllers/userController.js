import { User } from "../models/User.js";
import { Document } from "../models/Document.js";
import { Analysis } from "../models/Analysis.js";
import { ChatMessage } from "../models/ChatMessage.js";
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found",
            });
        }
        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.json({
            success: true,
            data: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                uploadCount: user.uploadCount,
                storageUsed: user.storageUsed,
                isPremium: user.isPremium,
                createdAt: user.createdAt.toISOString(),
            },
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get profile",
        });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        const { name, email, phone, avatar } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found",
            });
        }
        const user = await User.findByIdAndUpdate(userId, {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email }),
            ...(phone !== undefined && { phone }),
            ...(avatar !== undefined && { avatar }),
        }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.json({
            success: true,
            data: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                uploadCount: user.uploadCount,
                storageUsed: user.storageUsed,
                isPremium: user.isPremium,
            },
            message: "Profile updated successfully",
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};
export const getDocumentHistory = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found",
            });
        }
        const documents = await Document.find({ userId }).sort({ uploadedAt: -1 }).lean();
        const response = documents.map((doc) => ({
            id: doc.documentId,
            documentId: doc.documentId,
            name: doc.name,
            size: doc.size,
            type: doc.type,
            uploadedAt: doc.uploadedAt.toISOString(),
            analyzed: doc.analyzed,
        }));
        return res.json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        console.error("Get document history error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get document history",
        });
    }
};
export const getDocumentWithAnalysis = async (req, res) => {
    try {
        const { documentId } = req.params;
        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: "Document ID is required",
            });
        }
        const document = await Document.findOne({ documentId }).lean();
        const analysis = await Analysis.findOne({ documentId }).lean();
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        return res.json({
            success: true,
            data: {
                document: {
                    id: document.documentId,
                    name: document.name,
                    size: document.size,
                    type: document.type,
                    uploadedAt: document.uploadedAt.toISOString(),
                },
                analysis: analysis
                    ? {
                        summary: analysis.summary,
                        insights: analysis.insights,
                        generatedAt: analysis.generatedAt.toISOString(),
                    }
                    : null,
            },
        });
    }
    catch (error) {
        console.error("Get document with analysis error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get document details",
        });
    }
};
export const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.userId;
        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: "Document ID is required",
            });
        }
        const document = await Document.findOne({
            documentId,
            userId,
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        const user = await User.findById(userId);
        if (user) {
            user.uploadCount = Math.max(0, user.uploadCount - 1);
            user.storageUsed = Math.max(0, user.storageUsed - document.size);
            await user.save();
        }
        await Document.deleteOne({ documentId });
        await Analysis.deleteOne({ documentId });
        await ChatMessage.deleteMany({ documentId });
        return res.json({
            success: true,
            message: "Document deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete document error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete document",
        });
    }
};
//# sourceMappingURL=userController.js.map