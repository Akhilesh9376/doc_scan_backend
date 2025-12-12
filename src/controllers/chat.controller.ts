import { RequestHandler } from "express";
import { getModel, isMongoConnected } from "../database/mongo.js";
import { getUserFromToken } from "../controllers/auth.js";
import {
  chatMessagesMap,
  documentsMap,
  fileBuffersMap,
} from "../utils/memoryStore.js";
import { generateAIChatResponse } from "../services/chat.service.js";
import { getIO } from "../websocket/socket.js";

import { getGeminiClient, GEMINI_LLM_MODEL_AI } from "../config/gemini.js";
import { createUserContent, createPartFromUri } from "@google/genai";
import { generateMockResponse } from "../utils/mockData.js";
import { uploadDocumentBufferToGemini } from "../services/geminiFile.service.js";
export const handleGetChatMessages: RequestHandler = async (req, res) => {
  const ChatMessageModel = getModel("ChatMessage");

  try {
    const { documentId } = req.params;
    let messages: any[] = [];

    if (isMongoConnected()) {
      try {
        messages = await ChatMessageModel.find({ documentId })
          .sort({ timestamp: 1 })
          .lean();
      } catch {
        messages = chatMessagesMap.get(documentId) || [];
      }
    } else {
      messages = chatMessagesMap.get(documentId) || [];
    }

    const response = messages.map((msg) => ({
      id: msg.id || msg._id?.toString(),
      documentId: msg.documentId,
      role: msg.role,
      content: msg.content,
      timestamp:
        typeof msg.timestamp === "string"
          ? msg.timestamp
          : msg.timestamp?.toISOString?.() || new Date().toISOString(),
      audioUrl: msg.audioUrl,
    }));

    return res.json({ success: true, data: response });
  } catch (error) {
    console.error("Get messages error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
};

export const handleSendChatMessage: RequestHandler = async (req, res) => {
  const DocumentModel = getModel("Document");
  const ChatMessageModel = getModel("ChatMessage");

  try {
    const { documentId } = req.params;
    const { content } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userId = token ? getUserFromToken(token) : undefined;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // allow client to pass a temp id so frontend can map the bubble immediately
    const clientTempId = (req.headers["x-temp-id"] || req.body?.tempId || "").toString() || undefined;

    // 1) Fetch document metadata
    let document: any;
    if (isMongoConnected()) {
      try {
        document = await DocumentModel.findOne({ documentId }).lean();
      } catch {
        document = documentsMap.get(documentId);
      }
    } else {
      document = documentsMap.get(documentId);
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const buffer = fileBuffersMap.get(documentId) || null;

    // 2) Create a chat record for the user's question (optional)
    const chatPairBase = {
      question: content,
      answer: "",
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await ChatMessageModel.findOneAndUpdate(
          { documentId },
          {
            $setOnInsert: {
              documentId,
              userId: userId || undefined,
            },
            $push: { chats: chatPairBase },
          },
          { upsert: true, new: true }
        ).lean();
      } catch (err) {
        const arr = chatMessagesMap.get(documentId) || [];
        arr.push(chatPairBase);
        chatMessagesMap.set(documentId, arr);
      }
    } else {
      const arr = chatMessagesMap.get(documentId) || [];
      arr.push(chatPairBase);
      chatMessagesMap.set(documentId, arr);
    }

    // 3) Tell client everything is ok (we stream via socket)
    res.json({
      success: true,
      message: "Streaming answer via WebSocket",
    });

    const io = getIO();

    // 4) If no buffer, send mock response (unchanged)
    if (!buffer) {
      console.warn("[GEMINI CHAT] No buffer, cannot stream. Using mock.");
      const mock = generateMockResponse(content);
      const msgId = clientTempId ?? `msg-${Date.now()}-ai`;

      io.to(documentId).emit("chat:stream", {
        id: msgId,
        documentId,
        role: "assistant",
        content: mock,
        timestamp: new Date().toISOString(),
        isLoading: false,
      });
      return;
    }

    const ai = getGeminiClient();
    const geminiFile = await uploadDocumentBufferToGemini(buffer, document.type, document.name);

    const contents = [
      createUserContent([
        "You are a helpful assistant. Answer the question using ONLY the content of this document.",
        createPartFromUri(geminiFile.uri, geminiFile.mimeType),
        `User question: ${content}`,
      ]),
    ];

    // helper: small sleep to avoid flooding socket with too many events
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // ============================
    // 5) STREAMING (word-by-word)
    // ============================
    try {
      const streamResult = await ai.models.generateContentStream({
        model: GEMINI_LLM_MODEL_AI,
        contents,
      });

      // Use client temp id if provided so frontend bubble maps immediately.
      const msgId = clientTempId ?? `msg-${Date.now()}-ai`;
      let fullText = "";

      // send initial empty message so UI can attach the bubble immediately
      io.to(documentId).emit("chat:stream", {
        id: msgId,
        documentId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isLoading: true,
      });

      // Iterate the AsyncGenerator returned by Gemini client
      for await (const item of streamResult) {
        const raw = item.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (!raw) continue;

        // split into "words" conservatively (keeps punctuation). This will emit word-by-word.
        // If raw may include leading/trailing whitespace or partial words, splitting with \s+ is OK.
        const words = raw.split(/\s+/);

        for (const w of words) {
          if (!w) continue; // skip empty parts
          // append a space before the word unless fullText is empty or already ends with whitespace
          const needsSpace = fullText.length > 0 && !/\s$/.test(fullText);
          fullText += (needsSpace ? " " : "") + w;

          // emit cumulative content so client logic that replaces bubble works
          io.to(documentId).emit("chat:stream", {
            id: msgId,
            documentId,
            role: "assistant",
            content: fullText,
            timestamp: new Date().toISOString(),
            isLoading: true,
          });

          // small throttle — tune between 0 (no wait) and ~100ms depending on desired speed & server load.
          await sleep(25);
        }
      }

      // final event: mark as complete
      io.to(documentId).emit("chat:stream", {
        id: msgId,
        documentId,
        role: "assistant",
        content: fullText,
        timestamp: new Date().toISOString(),
        isLoading: false,
      });

      // TODO: persist fullText to ChatMessageModel if you want a permanent record
    } catch (err: any) {
      console.error("[GEMINI STREAM ERROR]", err);

      const msgId = clientTempId ?? `msg-${Date.now()}-ai-error`;
      let safeMessage = "I'm sorry, I was unable to process your request right now.";

      if (err?.status === 429 || err?.code === 429) {
        safeMessage = "Daily free limit for the AI model has been reached. Please try again later.";
      }

      io.to(documentId).emit("chat:stream", {
        id: msgId,
        documentId,
        role: "assistant",
        content: safeMessage,
        timestamp: new Date().toISOString(),
        isLoading: false,
      });

      return;
    }
  } catch (error) {
    console.error("Chat error (outer):", error);
    try {
      const io = getIO();
      io.to(req.params.documentId).emit("chat:stream", {
        id: `msg-${Date.now()}-ai-error`,
        documentId: req.params.documentId,
        role: "assistant",
        content: "I'm sorry, something went wrong while generating the answer.",
        timestamp: new Date().toISOString(),
        isLoading: false,
      });
    } catch {
      // ignore secondary errors
    }
  }
};




