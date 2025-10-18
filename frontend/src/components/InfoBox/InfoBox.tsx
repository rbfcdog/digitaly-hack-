// src/components/InfoBox.tsx
import React from "react";

interface InfoBoxProps {
  title: string;
  content: string;
  style?: React.CSSProperties;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, content, style }) => {
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
        maxHeight: "100%", // permite ocupar todo o espaço do flex
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
          whiteSpace: "pre-wrap", // interpreta \n como quebra de linha
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default InfoBox;
