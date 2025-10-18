import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { agentService } from './api/services/agent.service.js';

const PORT = process.env.PORT || 3001;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Estrutura para armazenar histórico de mensagens por paciente
const messageHistory: Record<string, { role: string; content: string }[]> = {};

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // Recebe mensagens de paciente ou médico
  socket.on('chat_message', async (data: { patient_id: string; role: string; content: string }) => {
    const { patient_id, role, content } = data;

    // Adiciona à fila de mensagens
    if (!messageHistory[patient_id]) messageHistory[patient_id] = [];
    messageHistory[patient_id].push({ role, content });

    // Envia mensagem para todos conectados (médico e paciente)
    io.emit('chat_message', data);

    // Chama o agente para gerar análise
    try {
      const analysis = await agentService.analyzePatientConversation(patient_id, messageHistory[patient_id]);
      io.emit('agent_analysis', analysis); // envia análise para todos
    } catch (error) {
      console.error('Erro ao analisar conversa:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
