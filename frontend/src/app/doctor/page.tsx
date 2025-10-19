"use client";

import ChatBox from "@/components/ChatBox/ChatBox";
import InfoBox from "@/components/InfoBox/InfoBox";
import HeaderBar from "@/components/HeaderBar/Headerbar";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function MedicoPage() {
  const headerHeight = 60;
  const searchParams = useSearchParams();

  // Get parameters from URL
  const session_id = searchParams.get("session") || "";
  const role = "medic";
  const patient_id = searchParams.get("id") || undefined;

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
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "0.5rem",
              backgroundColor: "#fafafa",                                                                                                                                                                               
            }}
            session_id={session_id}
            role={role}
            patient_id={patient_id}                                                                                                                                                                                                                                                                               
          />
        </div>
      </div>
    </div>
  );
}
