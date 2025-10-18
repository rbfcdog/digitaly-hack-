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
      name: "Você",
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
          name: "Assistente",
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
        ...style,
      }}
    >
      {title && <h2 className="text-lg font-semibold mb-2"
                    style={{color:"black"}}>{title}</h2>}

      {/* Área das mensagens */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "0.5rem",
          padding: "0.5rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          minHeight: "200px",
          maxHeight: "400px",
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

        {/* 🔹 marcador invisível para rolar até o fim */}
        <div ref={messagesEndRef} />
      </div>

      {/* Campo de texto + botão */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
          style={{ color: "black" }}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
