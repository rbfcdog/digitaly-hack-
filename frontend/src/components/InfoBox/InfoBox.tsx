// src/components/InfoBox.tsx
import React from "react";

interface InfoBoxProps {
  title: string;
  content: string | null;
  style?: React.CSSProperties;
  loading?: boolean; // nova prop
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, content, style, loading = false }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "1rem",
        marginBottom: "1rem",
        overflowY: "auto",
        maxHeight: "100%",
        ...style,
      }}
    >
      <h3
        style={{
          fontWeight: 600,
          marginBottom: "0.5rem",
          color: "#000",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          color: "#333",
          whiteSpace: "pre-wrap",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          minHeight: "2em",
        }}
      >
        {loading ? (
          <>
            <div className="spinner" />
            <span>Chamando o agente...</span>
          </>
        ) : (
          content
        )}
      </div>

      {/* Spinner CSS */}
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #4a90e2;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default InfoBox;
