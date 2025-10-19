import React from "react";

interface ChatMessageProps {
  sender: "patient" | "medic";
  currentUserRole: "patient" | "medic";
  name: string;
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  currentUserRole,
  name,
  text,
}) => {
  // Align right if message is from current user
  const isCurrentUser = sender === currentUserRole;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isCurrentUser ? "flex-end" : "flex-start",
        marginBottom: "0.75rem",
      }}
    >
      {/* Icon + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        {!isCurrentUser && (
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#10b981", // other participant
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              fontSize: "0.8rem",
            }}
          >
            {name[0]}
          </div>
        )}
        <strong style={{ fontSize: "0.8rem", color: "#000" }}>{name}</strong>
      </div>

      {/* Message box */}
      <div
        style={{
          backgroundColor: isCurrentUser ? "#e0f2fe" : "#f0fdf4",
          borderRadius: "8px",
          padding: "0.5rem 0.75rem",
          marginTop: "0.25rem",
          maxWidth: "80%",
          wordWrap: "break-word",
          color: "#000",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;
