"use client";

import ChatBox from "@/components/ChatBox/ChatBox";
import InfoBox from "@/components/InfoBox/InfoBox";
import HeaderBar from "@/components/HeaderBar/Headerbar";
import Notification from "@/components/Notification/notification";
import React, {useState, useEffect} from "react";

export default function MedicoPage() {
  const headerHeight = 60;
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  useEffect(() => {
    setNotifMessage("Bem-vindo ao atendimento virtual!");
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        // 🎨 fundo moderno e tranquilo
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* HEADER */}
      <HeaderBar height={headerHeight} />

       {/* Notification */}
       <Notification
        message={notifMessage || ""}
        duration={3000}
        visible={!!notifMessage}
        onClose={() => setNotifMessage(null)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "1rem",
          padding: "1rem",
          boxSizing: "border-box",
          height: `calc(100vh - ${headerHeight}px)`,
        }}
      >
        {/* LADO ESQUERDO */}
        <div
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            height: "100%",
          }}
        >
          <InfoBox
            title="Identificação do Paciente"
            content={`Nome: João Silva\nIdade: 35 anos\nSexo: Masculino`}
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
          <InfoBox
            title="Sintomas"
            content={`Febre, tosse seca, cansaço.`}
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
          <InfoBox
            title="Observações"
            content={`Paciente apresentou melhora parcial após medicação anterior.`}
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
          <InfoBox
            title="Sugestão de Plano de Ação"
            content={`Solicitar exames laboratoriais; monitorar sintomas; prescrever medicamento X se necessário.`}
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
        </div>

        {/* LADO DIREITO */}
        <div
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <ChatBox
            title="Atendimento Virtual"
            style={{
              height: "98%",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "12px",
              padding: "0.5rem",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
