import React from "react";

interface HeaderBarProps {
  height?: number;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ height = 60 }) => {
  return (
    <header
      style={{
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        padding: "0 1rem",
        backgroundColor: "#3b82f6",
        color: "#fff",
        gap: "1rem",
      }}
    >
      {/* Bolinha */}
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#3b82f6",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        M
      </div>

      {/* Links */}
      <nav style={{ display: "flex", gap: "1rem", fontWeight: 600 }}>
        <a href="#" style={{ color: "#fff", textDecoration: "none" }}>
          Início
        </a>
        <a href="#" style={{ color: "#fff", textDecoration: "none" }}>
          Dados Pessoais
        </a>
      </nav>
    </header>
  );
};

export default HeaderBar;
