import React from "react";

interface HeaderBarProps {
  height?: number;
  patient_id?: string;
  session_id?: string;
  baseUrl?: string;
  onDashboardClick?: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  height = 60,
  patient_id,
  session_id,
  baseUrl = "",
  onDashboardClick,
}) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Funções de hover para links e bolinha
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.textShadow = "0 0 10px rgba(255,255,255,0.9)";
    e.currentTarget.style.transform = "scale(1.05)";
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.textShadow = "none";
    e.currentTarget.style.transform = "scale(1)";
  };

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
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          M
        </div>

        <nav style={{ display: "flex", gap: "1rem", alignItems: "center", fontWeight: 600 }}>
          {["Início", "Dados Pessoais"].map((text) => (
            <a
              key={text}
              href="#"
              style={{
                color: "#fff",
                textDecoration: "none",
                transition: "text-shadow 0.3s ease, transform 0.3s ease",
              }}
              // 👇 EFEITOS DE VOLTA
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {text}
            </a>
          ))}

          {/* Link do paciente */}
          {patient_id && session_id && (
            <a
              href={`${baseUrl}/patient?session=${session_id}&id=${patient_id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#fff",
                textDecoration: "none",
                transition: "text-shadow 0.3s ease, transform 0.3s ease",
              }}
               // 👇 EFEITOS DE VOLTA
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Página do Paciente
            </a>
          )}

          {/* Botão Dashboard (só aparece se onDashboardClick for passado) */}
          {onDashboardClick && (
            <button
              onClick={onDashboardClick}
              style={{
                marginLeft: "auto",
                backgroundColor: "#fff",
                color: "#3b82f6",
                border: "none",
                borderRadius: "8px",
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Dashboard
            </button>
          )}
        </nav>
      </div>

      <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{formattedDate}</div>
    </header>
  );
};

export default HeaderBar;