import React from "react";
import { User, Stethoscope } from "lucide-react";

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
  const isMedic = sender === "medic";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isCurrentUser ? "flex-end" : "flex-start",
        marginBottom: "1rem",
      }}
    >
      {/* Icon + Name */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem",
          marginBottom: "0.25rem",
        }}
      >
        {!isCurrentUser && (
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: isMedic 
                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              fontSize: "0.8rem",
              boxShadow: isMedic 
                ? "0 2px 8px rgba(59, 130, 246, 0.3)"
                : "0 2px 8px rgba(16, 185, 129, 0.3)",
            }}
          >
            {isMedic ? <Stethoscope size={16} /> : <User size={16} />}
          </div>
        )}
        <strong 
          style={{ 
            fontSize: "0.85rem", 
            color: isMedic ? "#1d4ed8" : "#059669",
            fontWeight: 600,
          }}
        >
          {name}
        </strong>
        {isCurrentUser && (
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: isMedic 
                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              fontSize: "0.8rem",
              boxShadow: isMedic 
                ? "0 2px 8px rgba(59, 130, 246, 0.3)"
                : "0 2px 8px rgba(16, 185, 129, 0.3)",
            }}
          >
            {isMedic ? <Stethoscope size={16} /> : <User size={16} />}
          </div>
        )}
      </div>

      {/* Message box */}
      <div
        style={{
          backgroundColor: isCurrentUser 
            ? (isMedic ? "#dbeafe" : "#d1fae5") 
            : (isMedic ? "#eff6ff" : "#ecfdf5"),
          border: isCurrentUser 
            ? (isMedic ? "2px solid #3b82f6" : "2px solid #10b981")
            : "1px solid #e5e7eb",
          borderRadius: isCurrentUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "0.75rem 1rem",
          marginTop: "0.25rem",
          maxWidth: "75%",
          wordWrap: "break-word",
          color: "#1f2937",
          fontSize: "0.95rem",
          lineHeight: "1.5",
          boxShadow: isCurrentUser 
            ? (isMedic 
              ? "0 2px 8px rgba(59, 130, 246, 0.15)"
              : "0 2px 8px rgba(16, 185, 129, 0.15)")
            : "0 1px 3px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = isCurrentUser 
            ? (isMedic 
              ? "0 4px 12px rgba(59, 130, 246, 0.25)"
              : "0 4px 12px rgba(16, 185, 129, 0.25)")
            : "0 2px 6px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = isCurrentUser 
            ? (isMedic 
              ? "0 2px 8px rgba(59, 130, 246, 0.15)"
              : "0 2px 8px rgba(16, 185, 129, 0.15)")
            : "0 1px 3px rgba(0, 0, 0, 0.1)";
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;
