"use client";

import React, { useState } from "react";
import ChatBox from "@/components/ChatBox/ChatBox";
import InfoBox from "@/components/InfoBox/InfoBox";
import HeaderBar from "@/components/HeaderBar/Headerbar";
import { useSearchParams } from "next/navigation";

import { agentConversation } from "@/services/agentService";

export default function MedicoPage() {
  const headerHeight = 60;
  const searchParams = useSearchParams();

  // URL parameters
  const session_id = searchParams.get("session") || "";
  const role = "medic";
  const patient_id = searchParams.get("id") || undefined;

  // Example state to show the trigger in action
  const [lastTrigger, setLastTrigger] = useState<Date | null>(null);

  const handleMessageTrigger = async () => {
    console.log("💬 Novo evento de mensagem recebido!");
    setLastTrigger(new Date());

    try {
      // Wait for your analysis result
      const analysis = await agentConversation(patient_id!);

      // analysis is a typed object — stringify it for clarity
      console.log("🧠 Analysis result:", JSON.stringify(analysis, null, 2));
    } catch (error) {
      console.error("❌ Error while analyzing conversation:", error);
    }
  };
  
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <HeaderBar height={headerHeight} />

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
            style={{ flex: 1, overflowY: "auto" }}
          />
          <InfoBox
            title="Sintomas"
            content={`Febre, tosse seca, cansaço.`}
            style={{ flex: 1, overflowY: "auto" }}
          />
          <InfoBox
            title="Observações"
            content={`Paciente apresentou melhora parcial após medicação anterior.`}
            style={{ flex: 1, overflowY: "auto" }}
          />
          <InfoBox
            title="Sugestão de Plano de Ação"
            content={`Solicitar exames laboratoriais; monitorar sintomas; prescrever medicamento X se necessário.`}
            style={{ flex: 1, overflowY: "auto" }}
          />
          {/* Mostra o último trigger como exemplo */}
          {lastTrigger && (
            <InfoBox
              title="Último Trigger"
              content={`Última mensagem recebida em: ${lastTrigger.toLocaleTimeString()}`}
              style={{ flex: 0.5, overflowY: "auto" }}
            />
          )}
        </div>

        {/* LADO DIREITO (CHAT) */}
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
            session_id={session_id}
            role={role}
            patient_id={patient_id}
            onMessageTrigger={handleMessageTrigger} // 🔥 Trigger callback
            style={{
              height: "98%",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "0.5rem",
              backgroundColor: "#fafafa",
            }}
          />
        </div>
      </div>
    </div>
  );
}
