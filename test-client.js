import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

// Escuta mensagens recebidas
socket.on("chat_message", (msg) => {
  console.log("Mensagem recebida:", msg);
});

socket.on("agent_analysis", (analysis) => {
  console.log("Análise do agente:", analysis);
});

// Envia uma mensagem simulada
socket.emit("chat_message", {
  patient_id: "001",
  role: "paciente",
  content: "Estou com fadiga e dor no peito há 3 dias."
});

socket.emit("chat_message", {
  patient_id: "001",
  role: "medico",
  content: "Você sentiu falta de ar ou febre?"
});

socket.emit("chat_message", {
  patient_id: "001",
  role: "paciente",
  content: "Senti falta de ar mas não senti febre"
});

socket.emit("chat_message", {
  patient_id: "001",
  role: "medico",
  content: "Você esteve perto de pessoas doentes durante esse período"
});

socket.emit("chat_message", {
  patient_id: "001",
  role: "paciente",
  content: "Estive perto de pessoas doentes, também sinto dor no pé"
});




// Mantém o cliente rodando
setTimeout(() => {
  console.log("Finalizando teste.");
  socket.disconnect();
}, 15000);
