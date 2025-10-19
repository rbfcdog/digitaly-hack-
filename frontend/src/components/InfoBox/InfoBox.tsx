import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Pair {
  label: string;
  level: "leve" | "medio" | "grave" | "gravissimo";
}

interface InfoBoxProps {
  title: string;
  content?: string | Pair[];
  style?: React.CSSProperties;
  loading?: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, content, style, loading = false }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "scale(1.03)" : "scale(1)",
        boxShadow: hovered ? "0 8px 20px rgba(0,0,0,0.15)" : "0 4px 12px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      <h3
        style={{
          fontWeight: 600,
          marginBottom: "0.5rem",
          color: "#000",
          wordBreak: "break-word",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          color: "#333",
          whiteSpace: "pre-wrap",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          minHeight: "2em",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          lineHeight: 1.4,
        }}
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className="spinner" />
            <span>Chamando o agente...</span>
          </div>
        ) : Array.isArray(content) ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {content.map((item, idx) => (
              <Badge
                key={idx}
                className={
                  item.level === "leve"
                    ? "bg-green-200 text-green-800"
                    : item.level === "medio"
                    ? "bg-yellow-200 text-yellow-800"
                    : item.level === "grave"
                    ? "bg-orange-200 text-orange-800"
                    : "bg-red-200 text-red-900"
                }
              >
                {item.label}: {item.level}
              </Badge>
            ))}
          </div>
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
