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
  patient_name?: string; // nome do paciente
  onMessageTrigger?: () => void; // <- nova prop
}

const ChatBox: React.FC<ChatBoxProps> = ({
  title = "Chat",
  placeholder = "Digite sua mensagem...",
  style,
  session_id,
  role,
  patient_id,
  patient_name,
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
          name: data.role === "medic" ? "Dr. Médico" : (patient_name || "Paciente"),
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
  const sendMessage = async () => {
    if (!input.trim()) return;

    const message : NewMessage = {
      session_id: session_id,
      sender_role: role === "medic" ? "doctor" : "patient",
      patient_id: patient_id || "",
      message: input,
    };
    
    await insertMessage(message)

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
        border: "2px solid #e5e7eb",
        borderRadius: "16px",
        padding: "1.25rem",
        backgroundColor: "#ffffff",
        height: "100%",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        ...style,
      }}
    >
      {title && (
        <h2 
          style={{ 
            color: "#1f2937", 
            fontWeight: 700, 
            marginBottom: "1rem",
            fontSize: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          💬 {title}
        </h2>
      )}

      {/* Chat messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
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
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            padding: "0.75rem 1rem",
            color: "#1f2937",
            fontSize: "0.95rem",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e7eb";
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "white",
            borderRadius: "12px",
            padding: "0.75rem 1.5rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.3)";
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
