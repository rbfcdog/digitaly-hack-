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
  const [consultaAtrasadaMsg, setConsultaAtrasadaMsg] = useState<string | null>(null);



  const [patientInfo, setPatientInfo] = useState<ClientInfo | null>(null);

  const fetchPatientInfo = async () => {
    const info = await queryClientInfo(patient_id!);
    setPatientInfo(info);
  }

  useEffect(() => {
    if (patient_id) {
      fetchPatientInfo();
    }
  }, [patient_id]);



  // 🔥 Triggered whenever ChatBox receives a new message
  const handleMessageTrigger = async () => {
    console.log("💬 Novo evento de mensagem recebido!");
    setLastTrigger(new Date());

    try {
      const analysis = await agentConversation(patient_id!);
      setAnalysisResult(analysis);

      console.log("🧠 Analysis result:", JSON.stringify(analysis, null, 2));
    } catch (error) {
      console.error("❌ Error while analyzing conversation:", error);
    }
  };

    // 🟦 Mensagem inicial de boas-vindas
  useEffect(() => {
    setNotifMessage("Bem-vindo ao atendimento virtual!");
  }, []);

  // 🟥 Verifica se a consulta está atrasada e gera mensagem detalhada
  useEffect(() => {
    if (!patientInfo?.proxima_consulta) {
      setConsultaAtrasadaMsg(null);
      return;
    }

    let proxima: Date | null = null;

    // 🛠️ Trata formatos diferentes de data
    const valor = patientInfo.proxima_consulta.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
      // formato ISO (ex: 2025-10-10)
      proxima = new Date(valor);
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      // formato brasileiro (ex: 10/10/2025)
      const [dia, mes, ano] = valor.split("/");
      proxima = new Date(`${ano}-${mes}-${dia}T00:00:00`);
    } else {
      console.warn("⚠️ Formato de data não reconhecido:", valor);
      setConsultaAtrasadaMsg(null);
      return;
    }

    if (isNaN(proxima.getTime())) {
      console.warn("❌ Data inválida:", proxima);
      return;
    }

    const hoje = new Date();
    const diffDias = Math.floor((hoje.getTime() - proxima.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`📅 Diferença de dias: ${diffDias}`);

    if (diffDias > 7) {
      const dataFormatada = proxima.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      setConsultaAtrasadaMsg(
        `Esse paciente está com consulta atrasada! A última consulta deveria ter ocorrido em ${dataFormatada}.`
      );
    } else {
      setConsultaAtrasadaMsg(null);
    }
  }, [patientInfo]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* HEADER */}
      <HeaderBar height={headerHeight} />

      {/* Notificação de boas-vindas */}
      <Notification
        message={notifMessage || ""}
        visible={!!notifMessage}
        duration={10000}
        color="green"
        offsetY={20}
        onClose={() => setNotifMessage(null)}
      />

      {/* 🔴 Notificação de consulta atrasada */}
      {consultaAtrasadaMsg && (
        <Notification
          message={consultaAtrasadaMsg}
          visible={true}
          duration={15000}
          color="red"
          offsetY={70}
          onClose={() => setConsultaAtrasadaMsg(null)}
        />
      )}

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
            content={`ID: ${patient_id || "Carregando..."}\nNome: ${patientInfo?.nome_paciente || "Carregando..."}\nIdade: ${patientInfo?.idade || "Carregando..."}\nSexo: ${patientInfo?.sexo || "Carregando..."}`}
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "0.5rem",
            }}
          />

          <InfoBox
            title="Sintomas"
            content={
              analysisResult?.sintomas?.length
                ? analysisResult.sintomas.join(", ")
                : "Sem sintomas identificados ainda."
            }
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "0.5rem",
            }}
          />

          <InfoBox
            title="Observações"
            content={analysisResult?.observacoes || "Nenhuma observação disponível."}
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "0.5rem",
            }}
          />

          <InfoBox
            title="Sugestão de Plano de Ação"
            content={
              analysisResult?.sugestao_plano || "Aguardando sugestão do modelo..."
            }
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "0.5rem",
            }}
          />

          <InfoBox
            title="Informações Importantes"
            content={
              analysisResult?.important_info?.length
                ? analysisResult.important_info.join("// ")
                : "Aguardando análise do modelo..."
            }
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "0.5rem",
            }}
          />

          {patient_id && session_id && (
            <div
              onClick={() => {
                const url = `/patient?session=${session_id}&id=${patient_id}`;
                window.open(url, "_blank"); // open in new tab
              }}
              style={{ cursor: "pointer" }}
            >
              <InfoBox
                title="Link do Paciente"
                content={`$${baseUrl}/patient?session=${session_id}&id=${patient_id}`}
                style={{
                  flex: 0.5,
                  overflowY: "auto",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  padding: "0.5rem",
                }}
              />
            </div>
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
            onMessageTrigger={handleMessageTrigger}
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
