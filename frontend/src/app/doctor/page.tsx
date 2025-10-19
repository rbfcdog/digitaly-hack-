"use client";

import React, { useState, useEffect } from "react";
import ChatBox from "@/components/ChatBox/ChatBox";
import InfoBox from "@/components/InfoBox/InfoBox";
import HeaderBar from "@/components/HeaderBar/Headerbar";
import { useSearchParams } from "next/navigation";
import { agentConversation } from "@/services/agentService";
import { queryClientInfo } from "@/services/dbService";
import Notification from "@/components/notification/notification";

import type { PatientAnalysis, ClientInfo } from "@/types";

export default function MedicoPage() {
  const headerHeight = 60;
  const baseUrl = "http://localhost:3000";
  const searchParams = useSearchParams();

  const session_id = searchParams.get("session") || "";
  const role = "medic";
  const patient_id = searchParams.get("id") || undefined;

  const [lastTrigger, setLastTrigger] = useState<Date | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PatientAnalysis | null>(null);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPatientInfo = async () => {
    const info = await queryClientInfo(patient_id!);
    setPatientInfo(info);
  };

  useEffect(() => {
    if (patient_id) {
      fetchPatientInfo();
    }
  }, [patient_id]);

  // 🔥 Triggered whenever ChatBox receives a new message
  const handleMessageTrigger = async () => {
    console.log("💬 Novo evento de mensagem recebido!");
    setLastTrigger(new Date());
    setLoading(true);

    try {
      const analysis = await agentConversation(patient_id!);
      setAnalysisResult(analysis);
      console.log("🧠 Analysis result:", JSON.stringify(analysis, null, 2));
    } catch (error) {
      console.error("❌ Error while analyzing conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNotifMessage("Bem-vindo ao atendimento virtual!");
  }, []);

  const renderContent = (content: React.ReactNode) => {
    if (loading) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <div className="spinner"></div>
        </div>
      );
    }
    return content;
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <HeaderBar height={headerHeight} session_id={session_id} patient_id={patient_id} baseUrl={baseUrl} />

      <Notification
        message={notifMessage || ""}
        visible={!!notifMessage}
        duration={10000}
        onClose={() => setNotifMessage(null)}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "1rem",
          padding: "1rem",
          height: `calc(100vh - ${headerHeight}px)`,
          boxSizing: "border-box",
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
            content={`ID: ${patient_id || "Carregando..."}\nNome: ${patientInfo?.nome_paciente || "Carregando..."}\nIdade: ${patientInfo?.idade || "Carregando..."}\nSexo: ${patientInfo?.sexo || "Carregando..."}`}
            loading={!patientInfo}
          />

          <InfoBox
            title="Sintomas"
            content={analysisResult?.sintomas?.length ? analysisResult.sintomas.join(", ") : "Sem sintomas identificados ainda."}
            loading={analysisResult === null}
          />

          <InfoBox
            title="Observações"
            content={analysisResult?.observacoes || "Nenhuma observação disponível."}
            loading={analysisResult === null}
          />

          <InfoBox
            title="Sugestão de Plano de Ação"
            content={analysisResult?.sugestao_plano || "Aguardando sugestão do modelo..."}
            loading={analysisResult === null}
          />

          <InfoBox
            title="Informações Importantes"
            content={analysisResult?.important_info?.length ? analysisResult.important_info.join("// ") : "Aguardando análise do modelo..."}
            loading={analysisResult === null}
          />

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
            onMessageTrigger={handleMessageTrigger}
          />
        </div>
      </div>
    </div>
  );
}
