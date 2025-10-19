import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

import { createServer } from "http";
import { Server } from "socket.io";
import { agentService } from "./api/services/agent.service.js";
import { SessionsManager } from "./api/services/sessions.service.js";

const PORT = process.env.PORT || 3001;

// --- Create HTTP server and attach Socket.IO ---
const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// --- Socket.IO logic ---
const messageHistory: Record<string, { role: string; content: string }[]> = {};

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("join_room", (data: { hash: string; role: "medic" | "patient"; patient_id?: string }) => {
    const { hash, role, patient_id } = data;
    const allowedPatientId = SessionsManager.getPatientId(hash);

    if (!allowedPatientId) return socket.emit("error", "Sessão inválida");
    if (role === "patient" && patient_id !== allowedPatientId) {
      return socket.emit("error", "Você não tem permissão para entrar nesta sessão");
    }

    socket.join(hash);
    socket.data.role = role;
    socket.data.hash = hash;
    console.log(`${role} entrou na sala ${hash}`);
  });

  socket.on("chat_message", async (data: { hash: string; content: string }) => {
    const role = socket.data.role as "medic" | "patient";
    const hash = socket.data.hash as string;
    if (!role || !hash) return;

    // Save message history
    if (!messageHistory[hash]) messageHistory[hash] = [];
    messageHistory[hash].push({ role, content: data.content });

    // Broadcast to the other role
    const targetRole = role === "medic" ? "patient" : "medic";
    const socketsInRoom = await io.in(hash).fetchSockets();
    socketsInRoom.forEach((s) => {
      if (s.data.role === targetRole) {
        s.emit("chat_message", { role, content: data.content });
      }
    });

    // Agent analysis for medic
    try {
      const analysis = await agentService.analyzePatientConversation(
        SessionsManager.getPatientId(hash),
        messageHistory[hash]
      );

      socketsInRoom.forEach((s) => {
        if (s.data.role === "medic") s.emit("agent_analysis", analysis);
      });
    } catch (err) {
      console.error("Erro ao analisar conversa:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// --- Start server (both Express + Socket.IO) ---
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
