import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { agentService } from './api/services/agent.service.js';
import { SessionsManager } from './api/services/sessions.service.js';


const PORT = process.env.PORT || 3001;
const server = createServer(app);
// Inicializa o Socket.IO
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Histórico de mensagens por paciente
const messageHistory: Record<string, { role: string; content: string }[]> = {};

// Evento principal de conexão
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Cliente envia hash e role
  socket.on('join_room', (data: { hash: string; role: 'medic' | 'patient'; patient_id?: string }) => {
    const { hash, role, patient_id } = data;

    const allowedPatientId = SessionsManager.getPatientId(hash);
    if (!allowedPatientId) {
      return socket.emit('error', 'Sessão inválida');
    }

    if (role === 'patient' && patient_id !== allowedPatientId) {
      return socket.emit('error', 'Você não tem permissão para entrar nesta sessão');
    }

    socket.join(hash);
    socket.data.role = role;
    socket.data.hash = hash;
    console.log(`${role} entrou na sala ${hash}`);
  });

  socket.on('chat_message', async (data: { hash: string; content: string }) => {
    const role = socket.data.role as 'medic' | 'patient';
    const hash = socket.data.hash as string;

    if (!role || !hash) return;

    // Histórico
    if (!messageHistory[hash]) messageHistory[hash] = [];
    messageHistory[hash].push({ role, content: data.content });

    const targetRole = role === 'medic' ? 'patient' : 'medic';
    const socketsInRoom = await io.in(hash).fetchSockets();
    socketsInRoom.forEach((s) => {
      if (s.data.role === targetRole) {
        s.emit('chat_message', { role, content: data.content });
      }
    });

    // Análise do agente apenas para o médico
    try {
      const analysis = await agentService.analyzePatientConversation(
        SessionsManager.getPatientId(hash),
        messageHistory[hash]
      );

      socketsInRoom.forEach((s) => {
        if (s.data.role === 'medic') s.emit('agent_analysis', analysis);
      });
    } catch (err) {
      console.error('Erro ao analisar conversa:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});