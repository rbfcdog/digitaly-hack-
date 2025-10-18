"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  sender: "user" | "bot";
  name: string;
  text: string;
}

interface ChatBoxProps {
  title?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  title = "Chat",
  placeholder = "Digite sua mensagem...",
  style,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null); // 🔹 referência para o fim do chat

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      sender: "user",
      name: "Oruam",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simula resposta automática do bot
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          name: "Médico",
          text: "Essa é uma resposta automática :)",
        },
      ]);
    }, 800);
  };

  // 🔹 envia mensagem ao apertar Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🔹 mantém o scroll sempre no fim
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
  style={{
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "1rem",
    backgroundColor: "#fafafa",
    height: "100%", // ocupa toda a altura do container pai
    ...style,
  }}
>
  {title && (
    <h2 style={{ color: "black", fontWeight: 600, marginBottom: "0.5rem" }}>
      {title}
    </h2>
  )}

  {/* Área das mensagens */}
  <div
    style={{
      flex: 1,          // ocupa todo o espaço disponível vertical
      overflowY: "auto",
      padding: "0.5rem",
      backgroundColor: "#fff",
      borderRadius: "8px",
    }}
  >
    {messages.map((msg, idx) => (
      <ChatMessage
        key={idx}
        sender={msg.sender}
        name={msg.name}
        text={msg.text}
      />
    ))}
    <div ref={messagesEndRef} />
  </div>

  {/* Campo de texto + botão */}
  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      style={{
        flex: 1,
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "0.5rem",
        color: "black",
      }}
    />
    <button
      onClick={sendMessage}
      style={{
        backgroundColor: "#3b82f6",
        color: "white",
        borderRadius: "5px",
        padding: "0.5rem 1rem",
      }}
    >
      Enviar
    </button>
  </div>
</div>

  );
};

export default ChatBox;
