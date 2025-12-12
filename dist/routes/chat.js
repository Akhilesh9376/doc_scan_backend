import { Router } from "express";
import { handleGetChatMessages, handleSendChatMessage, } from "../controllers/chat.controller.js";
const router = Router();
router.get("/:documentId/messages", handleGetChatMessages);
router.post("/:documentId/messages", handleSendChatMessage);
export default router;
//# sourceMappingURL=chat.js.map