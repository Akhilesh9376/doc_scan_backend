import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import { initSocket } from "./websocket/socket.js";
// Auth controllers
import { handleSendOTP, handleVerifyOTP, handleVerifyToken, } from "./controllers/auth.js";
// Document controllers
import { handleUploadDocument, handleGetDocuments, handleAnalyzeDocument, } from "./controllers/documents.controller.js";
// Chat controllers
import { handleGetChatMessages, handleSendChatMessage, } from "./controllers/chat.controller.js";
// User routes (Router)
import userRoutes from "./routes/users.js";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ScanDownload";
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;
let mongoConnected = false;
if (NODE_ENV === "production") {
    mongoose
        .connect(MONGODB_URI)
        .then(() => {
        console.log("MongoDB connected");
        mongoConnected = true;
    })
        .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
}
else {
    // Development: Try to connect, but don't fail if MongoDB is not available
    mongoose
        .connect(MONGODB_URI)
        .then(() => {
        console.log("MongoDB connected");
        mongoConnected = true;
    })
        .catch((err) => {
        console.warn("MongoDB not available - using in-memory fallback for development");
        mongoConnected = false;
    });
}
export { mongoConnected };
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
});
export function createServer() {
    const app = express();
    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Authentication routes
    app.post("/api/auth/send-otp", handleSendOTP);
    app.post("/api/auth/verify-otp", handleVerifyOTP);
    app.get("/api/auth/verify-token", handleVerifyToken);
    // Document routes
    app.post("/api/documents/upload", upload.single("file"), handleUploadDocument);
    app.get("/api/documents", handleGetDocuments);
    app.get("/api/documents/:documentId/analyze", handleAnalyzeDocument);
    // Chat routes (still under /api/documents)
    app.get("/api/documents/:documentId/chat", handleGetChatMessages);
    app.post("/api/documents/:documentId/chat", handleSendChatMessage);
    // User routes
    app.use("/api/users", userRoutes);
    // Health check
    app.get("/api/ping", (_req, res) => {
        res.json({ message: "Server is running" });
    });
    return app;
}
const app = createServer();
// ⚠️ Instead of app.listen, create HTTP server and attach Socket.IO
import { createServer as createHttpServer } from "http";
const httpServer = createHttpServer(app);
// Initialize WebSocket
initSocket(httpServer);
httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
// app.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });
//# sourceMappingURL=index.js.map