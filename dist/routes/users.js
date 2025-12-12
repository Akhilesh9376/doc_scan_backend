import { Router } from "express";
import { getProfile, updateProfile, getDocumentHistory, getDocumentWithAnalysis, deleteDocument, } from "../controllers/userController.js";
import { getUserFromToken } from "../controllers/auth.js";
// Middleware to extract userId from token
const extractUserId = (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided",
        });
    }
    const userId = getUserFromToken(token);
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
    req.userId = userId;
    next();
};
const router = Router();
// User profile routes
router.get("/profile/:userId", getProfile);
router.patch("/profile/:userId", extractUserId, updateProfile);
// Document history routes
router.get("/documents/:userId", extractUserId, getDocumentHistory);
router.get("/documents/:documentId/details", getDocumentWithAnalysis);
router.delete("/documents/:documentId", extractUserId, deleteDocument);
export default router;
//# sourceMappingURL=users.js.map