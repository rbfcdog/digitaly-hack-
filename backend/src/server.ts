import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3001;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// --- Comunicação WebSocket entre médico e paciente ---
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('chat_message', (data) => {
    console.log('Mensagem recebida:', data);

    // Reenvia para todos os conectados (médico e paciente)
    io.emit('chat_message', data);

    // Aqui podemos também enviar a mensagem para o agente (IA)
    // e salvar no banco, futuramente.
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
