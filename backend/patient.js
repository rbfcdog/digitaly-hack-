// patient.js
const readline = require('readline');
const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';
const PATIENT_ID = '001'; // ID do paciente

// 🧩 Pegue a hash do link que o médico compartilhou
// Exemplo: http://localhost:3001/a1b2c3d4e5f6
const HASH = process.argv[2]; // passa como argumento na execução

if (!HASH) {
  console.log('❌ Uso: node patient.js <hash>');
  process.exit(1);
}

const socket = io(SERVER_URL);

socket.on('connect', () => {
  console.log('🧑‍🦰 Paciente conectado ao servidor WebSocket.');

  socket.emit('join_room', { hash: HASH, role: 'patient', patient_id: PATIENT_ID });

  socket.on('error', (err) => {
    console.log('⚠️ Erro:', err);
  });

  socket.on('chat_message', (msg) => {
    console.log(`👨‍⚕️ Médico: ${msg.content}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask() {
    rl.question('Você (paciente): ', (msg) => {
      socket.emit('chat_message', { hash: HASH, content: msg });
      ask();
    });
  }

  ask();
});
