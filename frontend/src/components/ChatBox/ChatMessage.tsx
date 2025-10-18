import React from "react";

interface ChatMessageProps {
  sender: "user" | "bot";
  name: string;
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, name, text }) => {
  const isUser = sender === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: "0.75rem",
      }}
    >
      {/* Linha com ícone e nome */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: isUser ? "#3b82f6" : "#10b981",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontSize: "0.8rem",
          }}
        >
          {name[0]}
        </div>
        <strong style={{ fontSize: "0.8rem", color: "#000" }}>{name}</strong>
      </div>

      {/* Caixa da mensagem */}
      <div
        style={{
          backgroundColor: isUser ? "#e0f2fe" : "#f0fdf4",
          borderRadius: "8px",
          padding: "0.5rem 0.75rem",
          marginTop: "0.25rem",
          maxWidth: "80%",
          wordWrap: "break-word",
          color: "#000", // 🔹 texto preto
          opacity: 1, // 🔹 sem transparência
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;
