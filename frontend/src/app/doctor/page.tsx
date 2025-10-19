"use client";

import React, { useState, useEffect } from "react";
import ChatBox from "@/components/ChatBox/ChatBox";
import InfoBox from "@/components/InfoBox/InfoBox";
import HeaderBar from "@/components/HeaderBar/Headerbar";
import DashboardModal from "@/components/DashboardModal/DashboardModal";
import { useSearchParams } from "next/navigation";
import { agentConversation } from "@/services/agentService";
import { queryClientInfo, queryAllClientsInfo} from "@/services/dbService";
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
  const [showDashboard, setShowDashboard] = useState(false); 




  const [patientInfo, setPatientInfo] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(false);


  const [allPatientsInfo, setAllPatientsInfo] = useState<ClientInfo[] | null>(null);

  const fetchPatientInfo = async () => {
    const info = await queryClientInfo(patient_id!);
    setPatientInfo(info);
  };

  useEffect(() => {
    if (patient_id) {
      fetchPatientInfo();
    }
  }, [patient_id]);

  const fetchAllPatientsInfo = async () => {
    const info = await queryAllClientsInfo();
    setAllPatientsInfo(info);
  }

  useEffect(() => {
      fetchAllPatientsInfo();
  }, []);


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


  // 🧮 Função para gerar dados de gráfico a partir do allPatientsInfo
const generateChartData = (field: keyof ClientInfo) => {
  if (!allPatientsInfo) return [];
  const counts: Record<string, number> = {};
  allPatientsInfo.forEach(p => {
    const key = p[field] || "Desconhecido";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

// Dados dinâmicos para o dashboard
const estadiamentoData = generateChartData("estadiamento");
const tipoCancerData = generateChartData("tipo_cancer");
const statusJornadaData = generateChartData("status_jornada");

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <HeaderBar height={headerHeight} session_id={session_id} patient_id={patient_id} baseUrl={baseUrl} onDashboardClick={() => setShowDashboard(true)} />

      <DashboardModal
        visible={showDashboard}
        onClose={() => setShowDashboard(false)}
        estadiamentoData={estadiamentoData}
        tipoCancerData={tipoCancerData}
        statusJornadaData={statusJornadaData}
      />

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
