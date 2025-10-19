import React from "react";

interface HeaderBarProps {
  height?: number;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ height = 60 }) => {
  // Formatar a data atual
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header
      style={{
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        backgroundColor: "#3b82f6",
        color: "#fff",
      }}
    >
      {/* LADO ESQUERDO: Bolinha + Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
      </div>

      {/* LADO DIREITO: Data atual */}
      <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{formattedDate}</div>
    </header>
  );
};

export default HeaderBar;
