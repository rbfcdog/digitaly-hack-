"use client";

import React, { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";

import ChatMessage from "./ChatMessage";
import { insertMessage } from "@/services/dbService";
import { NewMessage } from "@/types";
import { on } from "events";

interface Message {
  sender: "medic" | "patient";
  name: string;
  text: string;
}

interface ChatBoxProps {
  title?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  session_id: string;
  role: "medic" | "patient"; // current user role
  patient_id?: string;
  onMessageTrigger?: () => void; // <- nova prop
}

const ChatBox: React.FC<ChatBoxProps> = ({
  title = "Chat",
  placeholder = "Digite sua mensagem...",
  style,
  session_id,
  role,
  patient_id,
  onMessageTrigger, 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const onMessageTriggerRef = useRef(onMessageTrigger);
  useEffect(() => {
    onMessageTriggerRef.current = onMessageTrigger;
  }, [onMessageTrigger]);

  // Socket setup
  useEffect(() => {
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.emit("join_room", { hash: session_id, role, patient_id });

    const handleReceiveMessage = (data: { role: "medic" | "patient"; content: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: data.role,
          name: data.role === "medic" ? "Médico" : "Paciente",
          text: data.content,
        },
      ]);

      // ✅ Trigger the latest callback
      if (onMessageTriggerRef.current) {
        try {
          onMessageTriggerRef.current();
        } catch (err) {
          console.error("Error in onMessageTrigger:", err);
        }
      }
    };

    socket.on("chat_message", handleReceiveMessage);

    if (onMessageTrigger) {
      onMessageTrigger();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("chat_message", handleReceiveMessage);
        socketRef.current.disconnect();
      }
    };
  }, [session_id, role, patient_id]);

  // Send a message
  const sendMessage = () => {
    if (!input.trim()) return;

    const message : NewMessage = {
      session_id: session_id,
      sender_role: role === "medic" ? "doctor" : "patient",
      patient_id: patient_id || "",
      message: input,
    };
    
    insertMessage(message)

    const userMessage: Message = {
      sender: role, // current user role
      name: "Você",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    socketRef.current?.emit("chat_message", {
      hash: session_id,
      content: input,
    });

    if (onMessageTrigger) onMessageTrigger();

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

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
        height: "100%",
        ...style,
      }}
    >
      {title && (
        <h2 style={{ color: "black", fontWeight: 600, marginBottom: "0.5rem" }}>
          {title}
        </h2>
      )}

      {/* Chat messages area */}
      <div
        style={{
          flex: 1,
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
            currentUserRole={role} // pass current user role
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input field + button */}
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
