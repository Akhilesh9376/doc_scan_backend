import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { createServer as createHttpServer } from "http";
import { initSocket } from "./websocket/socket.js";
import { connectDB } from "./utils/dbConnect.js";
// Auth controllers
import { handleSendOTP, handleVerifyOTP, handleVerifyToken, } from "./controllers/auth.js";
// Document controllers
import { handleUploadDocument, handleGetDocuments, handleAnalyzeDocument, } from "./controllers/documents.controller.js";
// Chat controllers
import { handleGetChatMessages, handleSendChatMessage, } from "./controllers/chat.controller.js";
// User routes
import userRoutes from "./routes/users.js";
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    "http://localhost:8080",
    "https://docscanapp.vercel.app",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
// Multer config
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
});
export function createServer() {
    const app = express();
    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Auth routes
    app.post("/api/auth/send-otp", handleSendOTP);
    app.post("/api/auth/verify-otp", handleVerifyOTP);
    app.get("/api/auth/verify-token", handleVerifyToken);
    // Document routes
    app.post("/api/documents/upload", upload.single("file"), handleUploadDocument);
    app.get("/api/documents", handleGetDocuments);
    app.get("/api/documents/:documentId/analyze", handleAnalyzeDocument);
    // Chat routes
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
async function startApp() {
    await connectDB();
    const app = createServer();
    const httpServer = createHttpServer(app);
    initSocket(httpServer);
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}
startApp();
//# sourceMappingURL=index.js.map