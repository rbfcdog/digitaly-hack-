import React from "react";

interface HeaderBarProps {
  height?: number;
  patient_id?: string;
  session_id?: string;
  baseUrl?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  height = 60,
  patient_id,
  session_id,
  baseUrl = "",
}) => {
  // Data formatada em pt-BR
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
        padding: "0 1.5rem",
        backgroundColor: "#3b82f6",
        color: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      {/* ESQUERDA: Logo + Navegação */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {/* Logo circular */}
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
            fontWeight: 700,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          M
        </div>

        {/* Navegação */}
        <nav style={{ display: "flex", gap: "1rem", fontWeight: 600 }}>
          <a
            href="#"
            style={{
              color: "#fff",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Início
          </a>
          <a
            href="#"
            style={{
              color: "#fff",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Dados Pessoais
          </a>

          {/* Link da página do paciente */}
          {patient_id && session_id && (
            <a
              href={`${baseUrl}/patient?session=${session_id}&id=${patient_id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#fff",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Acessar Página do Paciente
            </a>
          )}
        </nav>
      </div>

      {/* DIREITA: Data atual */}
      <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{formattedDate}</div>
    </header>
  );
};

export default HeaderBar;
