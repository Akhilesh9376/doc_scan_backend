import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // TODO: restrict to your frontend origin in prod
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("[WS] Client connected:", socket.id);

    // Join a room per document for chat
    socket.on("join-document", (documentId: string) => {
      socket.join(documentId);
      console.log(`[WS] Socket ${socket.id} joined room ${documentId}`);
    });

    socket.on("disconnect", () => {
      console.log("[WS] Client disconnected:", socket.id);
    });
  });

  console.log("[WS] Socket.IO initialized");
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket first.");
  }
  return io;
}
