// medic.js
const readline = require('readline');
const { io } = require('socket.io-client');
const axios = require('axios');

const SERVER_URL = 'http://localhost:3001';
const PATIENT_ID = '001';

async function main() {
  try {
    // Cria sessão via API
    const response = await axios.post(`${SERVER_URL}/api/actions/create-session`, {
      patient_id: PATIENT_ID,
    });

    const { url, hash } = response.data;
    console.log(`✅ Sessão criada! URL compartilhada com o paciente: ${url}`);

    // Conecta ao WebSocket
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('👨‍⚕️ Médico conectado ao servidor WebSocket.');

      // Entra na sala usando o hash
      socket.emit('join_room', { hash, role: 'medic' });

      socket.on('chat_message', (msg) => {
        console.log(`🧑‍🦰 Paciente: ${msg.content}`);
      });

      socket.on('agent_analysis', (analysis) => {
        console.log('\n=== 🧠 Análise do Agente ===');
        console.log(JSON.stringify(analysis, null, 2));
        console.log('============================\n');
      });

      // Input do terminal
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      function ask() {
        rl.question('Você (médico): ', (msg) => {
          socket.emit('chat_message', { hash, content: msg });
          ask();
        });
      }

      ask();
    });
  } catch (err) {
    console.error('Erro ao criar sessão:', err.message);
  }
}

main();
