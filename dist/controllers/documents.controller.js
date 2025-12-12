import dotenv from "dotenv";
import { getUserFromToken } from "../controllers/auth.js";
import { getModel, isMongoConnected } from "../database/mongo.js";
import { cloudinary } from "../config/cloudinary.js";
import { bufferToDataURI } from "../utils/buffer.js";
import { documentsMap, usersMap, analysesMap, fileBuffersMap, } from "../utils/memoryStore.js";
import { generateAISummaryFromBuffer, generateAIInsightsFromBuffer, generateMockInsights, generateMockSummary, } from "../services/analysis.service.js";
dotenv.config();
const MAX_GUEST_FILE_SIZE = 1024 * 1024; // 1 MB
const MAX_AUTH_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const FREE_TIER_DOCUMENT_LIMIT = 5;
const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
];
// ---- Upload Document ----
export const handleUploadDocument = async (req, res) => {
    const DocumentModel = getModel("Document");
    const UserModel = getModel("User");
    try {
        console.log("[UPLOAD] Upload request received");
        const token = req.headers.authorization?.replace("Bearer ", "");
        const userId = token ? getUserFromToken(token) : null;
        console.log("[UPLOAD] User ID:", userId || "guest");
        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, message: "No file provided" });
        }
        if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
            return res
                .status(400)
                .json({ success: false, message: "File type not supported" });
        }
        const isGuest = !userId;
        const maxSize = isGuest ? MAX_GUEST_FILE_SIZE : MAX_AUTH_FILE_SIZE;
        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: isGuest
                    ? `Guest users can only upload files up to 1MB (${(req.file.size /
                        1024 /
                        1024).toFixed(2)}MB provided)`
                    : `File size exceeds 50MB limit`,
            });
        }
        let userData = null;
        if (userId) {
            if (isMongoConnected()) {
                try {
                    userData = await UserModel.findById(userId).lean();
                }
                catch {
                    userData = usersMap.get(userId);
                }
            }
            else {
                userData = usersMap.get(userId);
            }
            if (!userData && isMongoConnected()) {
                return res
                    .status(401)
                    .json({ success: false, message: "User not found" });
            }
            const uploadCount = userData?.uploadCount || 0;
            const isPremium = userData?.isPremium || false;
            if (!isPremium && uploadCount >= FREE_TIER_DOCUMENT_LIMIT) {
                return res.status(429).json({
                    success: false,
                    message: "FREE_TIER_LIMIT_EXCEEDED",
                    error: "You have reached the free tier limit of 5 documents. Upgrade to premium for unlimited uploads.",
                });
            }
        }
        const documentId = `doc-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;
        const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);
        const publicId = `documents/${documentId}`;
        let uploadResult;
        try {
            uploadResult = await cloudinary.uploader.upload(dataURI, {
                public_id: publicId,
                resource_type: "auto",
                folder: "scandownload_docs",
                tags: [userId || "guest", documentId],
            });
        }
        catch (uploadError) {
            console.error("[CLOUDINARY ERROR] Upload failed:", uploadError);
            return res.status(500).json({
                success: false,
                message: "File upload to cloud storage failed",
            });
        }
        const docData = {
            documentId,
            userId: userId || null,
            name: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype,
            uploadedAt: new Date(),
            analyzed: false,
            analysisStatus: "pending",
            cloudinaryPublicId: uploadResult.public_id,
            cloudinaryUrl: uploadResult.secure_url,
        };
        fileBuffersMap.set(documentId, Buffer.from(req.file.buffer));
        if (isMongoConnected()) {
            try {
                await new DocumentModel(docData).save();
            }
            catch (err) {
                console.error("[UPLOAD] Failed to save metadata to MongoDB:", err);
                documentsMap.set(documentId, docData);
            }
        }
        else {
            documentsMap.set(documentId, docData);
        }
        if (userId && userData) {
            const newData = {
                uploadCount: (userData.uploadCount || 0) + 1,
                isPremium: userData.isPremium,
                storageUsed: (userData.storageUsed || 0) + req.file.size,
            };
            if (isMongoConnected()) {
                try {
                    await UserModel.findByIdAndUpdate(userId, newData);
                }
                catch {
                    usersMap.set(userId, { ...userData, ...newData });
                }
            }
            else {
                usersMap.set(userId, { ...userData, ...newData });
            }
        }
        return res.json({
            success: true,
            data: {
                id: documentId,
                name: req.file.originalname,
                size: req.file.size,
                type: req.file.mimetype,
                uploadedAt: new Date().toISOString(),
                userId,
                url: uploadResult.secure_url,
            },
            message: "Document uploaded successfully",
        });
    }
    catch (error) {
        console.error("[UPLOAD ERROR]", error);
        return res.status(500).json({ success: false, message: "Upload failed" });
    }
};
// ---- Get Documents ----
export const handleGetDocuments = async (req, res) => {
    const DocumentModel = getModel("Document");
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        const userId = token ? getUserFromToken(token) : null;
        let documents = [];
        if (isMongoConnected()) {
            try {
                const query = userId ? { userId } : { userId: null };
                documents = await DocumentModel.find(query)
                    .sort({ uploadedAt: -1 })
                    .lean();
            }
            catch {
                documents = Array.from(documentsMap.values()).filter((d) => userId ? d.userId === userId : !d.userId);
            }
        }
        else {
            documents = Array.from(documentsMap.values()).filter((d) => userId ? d.userId === userId : !d.userId);
        }
        const response = documents.map((doc) => ({
            id: doc.documentId || doc.id,
            name: doc.name,
            size: doc.size,
            type: doc.type,
            uploadedAt: typeof doc.uploadedAt === "string"
                ? doc.uploadedAt
                : doc.uploadedAt.toISOString(),
            userId: doc.userId?.toString?.() || doc.userId,
            url: doc.cloudinaryUrl,
        }));
        return res.json({ success: true, data: response });
    }
    catch (error) {
        console.error("Get documents error:", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to fetch documents" });
    }
};
// ---- Analyze Document ----
export const handleAnalyzeDocument = async (req, res) => {
    const DocumentModel = getModel("Document");
    const AnalysisModel = getModel("Analysis");
    try {
        const { documentId } = req.params;
        console.log("[ANALYZE] Analyze request for documentId:", documentId);
        let document;
        let analysis;
        if (isMongoConnected()) {
            try {
                document = await DocumentModel.findOne({ documentId }).lean();
                analysis = await AnalysisModel.findOne({ documentId }).lean();
            }
            catch {
                analysis = analysesMap.get(documentId);
                document = documentsMap.get(documentId);
            }
        }
        else {
            analysis = analysesMap.get(documentId);
            document = documentsMap.get(documentId);
        }
        if (!document) {
            return res
                .status(404)
                .json({ success: false, message: "Document not found" });
        }
        if (analysis) {
            return res.json({
                success: true,
                data: {
                    id: analysis.id || documentId,
                    documentId,
                    summary: analysis.summary,
                    insights: analysis.insights,
                    generatedAt: analysis.generatedAt,
                },
            });
        }
        let summary;
        let insights;
        const buffer = fileBuffersMap.get(documentId) || null;
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            console.warn("[ANALYSIS] API Key Missing. Using mock data.");
            summary = generateMockSummary(document.name);
            insights = generateMockInsights(document.name);
        }
        else if (!buffer) {
            console.error("[ANALYSIS] Document buffer missing in memory. Falling back to mock.");
            summary = generateMockSummary(document.name);
            insights = generateMockInsights(document.name);
        }
        else {
            try {
                console.log("[ANALYZE] Generating AI summary and insights for document:", document.name);
                summary = await generateAISummaryFromBuffer(buffer, document.type, document.name);
                insights = await generateAIInsightsFromBuffer(buffer, document.type, document.name);
                console.log("[ANALYZE] AI generation successful");
            }
            catch (err) {
                console.error("[ANALYSIS] AI generation failed, falling back to mock data:", err);
                summary = generateMockSummary(document.name);
                insights = generateMockInsights(document.name);
            }
        }
        const finalAnalysis = {
            id: `analysis-${Date.now()}`,
            documentId,
            summary,
            insights,
            generatedAt: new Date().toISOString(),
        };
        const analysisData = {
            documentId,
            summary: finalAnalysis.summary,
            insights: finalAnalysis.insights,
            generatedAt: new Date(),
        };
        if (isMongoConnected()) {
            try {
                await new AnalysisModel(analysisData).save();
                await DocumentModel.findOneAndUpdate({ documentId }, { analyzed: true, analysisStatus: "completed" });
            }
            catch {
                analysesMap.set(documentId, analysisData);
                const doc = documentsMap.get(documentId);
                if (doc)
                    doc.analyzed = true;
            }
        }
        else {
            analysesMap.set(documentId, analysisData);
            const doc = documentsMap.get(documentId);
            if (doc)
                doc.analyzed = true;
        }
        return res.json({ success: true, data: finalAnalysis });
    }
    catch (error) {
        console.error("Analysis error:", error);
        return res
            .status(500)
            .json({ success: false, message: "Analysis failed" });
    }
};
//# sourceMappingURL=documents.controller.js.map