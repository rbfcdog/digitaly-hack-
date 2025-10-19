"use client";

import React, { useState, useMemo } from "react";
import type { ClientInfo, PatientAnalysis } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AlertTriangle, Clock, FileText, Activity, User } from "lucide-react";

interface DashboardModalProps {
  visible: boolean;
  onClose: () => void;
  estadiamentoData: { name: string; value: number }[];
  tipoCancerData: { name: string; value: number }[];
  statusJornadaData: { name: string; value: number }[];
  patientsAge: { name: string; value: number }[];

  patients?: ClientInfo[];
  currentPatient?: ClientInfo; // 🆕 Paciente atual
  currentPatientAnalysis?: PatientAnalysis | null; // 🆕 Análise do paciente atual

  selectedGender?: "all" | "M" | "F";
  setSelectedGender?: React.Dispatch<React.SetStateAction<"all" | "M" | "F">>;
}

const COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#10b956ff",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#034903ff",
  "#080053ff",
  "#27ffe2ff",
];

const RISK_COLORS = {
  leve: "#10b981",
  medio: "#f59e0b",
  grave: "#ef4444",
  moderado: "#f97316",
};

const AGE_BUCKETS: { key: string; label: string; test: (age?: number) => boolean }[] = [
  { key: "0-18", label: "0-18", test: (a) => typeof a === "number" && a <= 18 },
  { key: "19-35", label: "19-35", test: (a) => typeof a === "number" && a >= 19 && a <= 35 },
  { key: "36-50", label: "36-50", test: (a) => typeof a === "number" && a >= 36 && a <= 50 },
  { key: "51-65", label: "51-65", test: (a) => typeof a === "number" && a >= 51 && a <= 65 },
  { key: "66+", label: "66+", test: (a) => typeof a === "number" && a >= 66 },
];

// 🚨 Função para calcular atrasos nas etapas (7 dias)
const calculateDelays = (patient: ClientInfo) => {
  const delays: string[] = [];
  const today = new Date();

  const parseDate = (dateStr?: string | Date): Date | null => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    
    const valor = String(dateStr).trim();
    let parsed: Date | null = null;

    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
      parsed = new Date(valor);
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      const [dia, mes, ano] = valor.split("/");
      parsed = new Date(`${ano}-${mes}-${dia}T00:00:00`);
    }

    return parsed && !isNaN(parsed.getTime()) ? parsed : null;
  };

  const diagnosticoData = parseDate(patient.diagnostico_data);
  const cirurgiaData = parseDate(patient.cirurgia_data);
  const quimioInicio = parseDate(patient.quimioterapia_inicio);

  // Diagnóstico → Estadiamento (se cirurgia não foi feita em 7 dias)
  if (diagnosticoData && !cirurgiaData) {
    const diff = Math.floor((today.getTime() - diagnosticoData.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 7) delays.push("Diagnóstico → Estadiamento");
  }

  // Estadiamento → Tratamento (se tratamento não iniciou em 7 dias após cirurgia)
  if (cirurgiaData && !quimioInicio) {
    const diff = Math.floor((today.getTime() - cirurgiaData.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 7) delays.push("Estadiamento → Tratamento");
  }

  return delays;
};

const DashboardModal: React.FC<DashboardModalProps> = ({
  visible,
  onClose,
  estadiamentoData,
  tipoCancerData,
  statusJornadaData,
  patientsAge,
  patients,
  currentPatient,
  currentPatientAnalysis,
  selectedGender = "all",
  setSelectedGender,
}) => {
  if (!visible) return null;

  const [ageFilters, setAgeFilters] = useState<Set<string>>(new Set());

  const toggleAgeFilter = (key: string) => {
    setAgeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const ageButtonStyle = (active: boolean) => ({
    padding: "0.4rem 0.65rem",
    margin: "0 0.25rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    color: active ? "#fff" : "#000",
    background: active ? "#10b956ff" : "#e5e7eb",
  });

  const hasRaw = Array.isArray(patients) && patients.length > 0;

  const filteredPatients = useMemo(() => {
    if (!hasRaw) return [];
    return patients!.filter((p) => {
      if (selectedGender !== "all") {
        if (((p.sexo || "") as string).toUpperCase() !== selectedGender) return false;
      }
      if (ageFilters.size === 0) return true;
      const age = p.idade;
      for (const key of ageFilters) {
        const bucket = AGE_BUCKETS.find((b) => b.key === key);
        if (bucket && bucket.test(age)) return true;
      }
      return false;
    });
  }, [patients, selectedGender, ageFilters, hasRaw]);

  // 🚨 Cálculo de Ações Críticas (Geral)
  const criticalMetrics = useMemo(() => {
    if (!hasRaw) return null;

    const patientsWithDelays = filteredPatients.filter(p => calculateDelays(p).length > 0);
    const criticalPatients = filteredPatients.filter(p => p.alerta_atraso === true);
    const pendingExams = filteredPatients.filter(p => !p.cirurgia_data && p.diagnostico_data);

    return {
      totalDelays: patientsWithDelays.length,
      criticalAlerts: criticalPatients.length,
      pendingExams: pendingExams.length,
      totalPatients: filteredPatients.length,
    };
  }, [filteredPatients, hasRaw]);

  // 🆕 Análise do Paciente Atual
  const currentPatientMetrics = useMemo(() => {
    if (!currentPatient) return null;

    const delays = calculateDelays(currentPatient);
    const hasAlert = currentPatient.alerta_atraso === true;
    const hasPendingExam = !currentPatient.cirurgia_data && currentPatient.diagnostico_data;

    // Análise de riscos da IA
    let riskDistribution = { leve: 0, medio: 0, grave: 0, moderado: 0 };
    
    if (currentPatientAnalysis?.alertas_risco) {
      currentPatientAnalysis.alertas_risco.forEach((alerta) => {
        const nivel = alerta.nivel_alerta.toLowerCase();
        if (nivel === "leve") riskDistribution.leve++;
        else if (nivel === "médio" || nivel === "medio") riskDistribution.medio++;
        else if (nivel === "grave") riskDistribution.grave++;
        else if (nivel === "moderado") riskDistribution.moderado++;
      });
    }

    // Análise de sintomas
    let symptomSeverity = { leve: 0, medio: 0, grave: 0, moderado: 0 };
    
    if (currentPatientAnalysis?.sintomas) {
      currentPatientAnalysis.sintomas.forEach((sintoma) => {
        const gravidade = sintoma.gravidade.toLowerCase();
        if (gravidade === "leve") symptomSeverity.leve++;
        else if (gravidade === "médio" || gravidade === "medio") symptomSeverity.medio++;
        else if (gravidade === "grave") symptomSeverity.grave++;
        else if (gravidade === "moderado") symptomSeverity.moderado++;
      });
    }

    return {
      delays,
      hasAlert,
      hasPendingExam,
      riskDistribution,
      symptomSeverity,
      totalRisks: Object.values(riskDistribution).reduce((a, b) => a + b, 0),
      totalSymptoms: Object.values(symptomSeverity).reduce((a, b) => a + b, 0),
    };
  }, [currentPatient, currentPatientAnalysis]);

  // 🆕 Dados para gráfico de riscos do paciente atual
  const currentPatientRiskChart = useMemo(() => {
    if (!currentPatientMetrics) return [];
    
    return [
      { name: "Leve", value: currentPatientMetrics.riskDistribution.leve, fill: RISK_COLORS.leve },
      { name: "Médio", value: currentPatientMetrics.riskDistribution.medio, fill: RISK_COLORS.medio },
      { name: "Moderado", value: currentPatientMetrics.riskDistribution.moderado, fill: RISK_COLORS.moderado },
      { name: "Grave", value: currentPatientMetrics.riskDistribution.grave, fill: RISK_COLORS.grave },
    ].filter(item => item.value > 0);
  }, [currentPatientMetrics]);

  // 🆕 Dados para gráfico de sintomas do paciente atual
  const currentPatientSymptomChart = useMemo(() => {
    if (!currentPatientMetrics) return [];
    
    return [
      { name: "Leve", value: currentPatientMetrics.symptomSeverity.leve, fill: RISK_COLORS.leve },
      { name: "Médio", value: currentPatientMetrics.symptomSeverity.medio, fill: RISK_COLORS.medio },
      { name: "Moderado", value: currentPatientMetrics.symptomSeverity.moderado, fill: RISK_COLORS.moderado },
      { name: "Grave", value: currentPatientMetrics.symptomSeverity.grave, fill: RISK_COLORS.grave },
    ].filter(item => item.value > 0);
  }, [currentPatientMetrics]);

  const aggregate = (items: ClientInfo[], key: keyof ClientInfo) => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      const k = String((it as any)[key] ?? "Desconhecido");
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  };

  const ageBucketsFromPatients = (items: ClientInfo[]) => {
    const buckets: Record<string, number> = {};
    AGE_BUCKETS.forEach((b) => (buckets[b.key] = 0));
    items.forEach((p) => {
      const a = p.idade;
      const matched = AGE_BUCKETS.some((b) => {
        if (b.test(a)) {
          buckets[b.key] += 1;
          return true;
        }
        return false;
      });
      if (!matched) buckets["Desconhecido"] = (buckets["Desconhecido"] || 0) + 1;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  };

  const estadiamentoForChart = hasRaw ? aggregate(filteredPatients, "estadiamento") : estadiamentoData;
  const tipoCancerForChart = hasRaw ? aggregate(filteredPatients, "tipo_cancer" as keyof ClientInfo) : tipoCancerData;
  const statusJornadaForChart = hasRaw ? aggregate(filteredPatients, "status_jornada" as keyof ClientInfo) : statusJornadaData;
  const patientsAgeForChart = hasRaw ? ageBucketsFromPatients(filteredPatients) : patientsAge;

  const buttonStyle = (gender: "all" | "M" | "F") => ({
    padding: "0.5rem 1rem",
    margin: "0 0.5rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    color: "#fff",
    background: selectedGender === gender ? "#3b82f6" : "#9ca3af",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "1400px",
          height: "90%",
          background: "#fff",
          borderRadius: "12px",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          overflowY: "auto",
          position: "relative",
          color: "#000",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: 600,
            zIndex: 10,
          }}
        >
          Fechar
        </button>

        <h2
          style={{
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#000",
          }}
        >
          📊 Dashboard de Pacientes
        </h2>

        {/* 🆕 SEÇÃO DO PACIENTE ATUAL */}
        {currentPatient && currentPatientMetrics && (
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1rem",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <User size={32} color="#fff" />
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                  Paciente Atual: {currentPatient.nome_paciente}
                </h3>
                <p style={{ fontSize: "0.9rem", margin: 0, opacity: 0.9 }}>
                  ID: {currentPatient.patient_id} | Idade: {currentPatient.idade} anos | {currentPatient.sexo === "M" ? "Masculino" : "Feminino"}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              {/* Status de Atraso */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Status de Etapas</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem" }}>
                  {currentPatientMetrics.delays.length > 0 ? (
                    <span style={{ color: "#fca5a5" }}>
                      ⚠️ {currentPatientMetrics.delays.length} Atraso(s)
                    </span>
                  ) : (
                    <span style={{ color: "#86efac" }}>✅ Em dia</span>
                  )}
                </div>
              </div>

              {/* Alertas */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Alertas de Risco</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem" }}>
                  {currentPatientMetrics.totalRisks} alerta(s)
                </div>
              </div>

              {/* Sintomas */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Sintomas Identificados</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem" }}>
                  {currentPatientMetrics.totalSymptoms} sintoma(s)
                </div>
              </div>

              {/* Exame Pendente */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Exames</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem" }}>
                  {currentPatientMetrics.hasPendingExam ? (
                    <span style={{ color: "#fde047" }}>⏳ Pendente</span>
                  ) : (
                    <span style={{ color: "#86efac" }}>✅ Realizado</span>
                  )}
                </div>
              </div>
            </div>

            {/* Gráficos do Paciente Atual */}
            <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
              {/* Gráfico de Alertas de Risco */}
              {currentPatientRiskChart.length > 0 && (
                <div style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "8px", padding: "1rem" }}>
                  <h4 style={{ textAlign: "center", color: "#000", marginBottom: "0.5rem" }}>
                    Distribuição de Alertas de Risco
                  </h4>
                  <PieChart width={280} height={200}>
                    <Pie
                      data={currentPatientRiskChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {currentPatientRiskChart.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              )}

              {/* Gráfico de Sintomas */}
              {currentPatientSymptomChart.length > 0 && (
                <div style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "8px", padding: "1rem" }}>
                  <h4 style={{ textAlign: "center", color: "#000", marginBottom: "0.5rem" }}>
                    Gravidade dos Sintomas
                  </h4>
                  <PieChart width={280} height={200}>
                    <Pie
                      data={currentPatientSymptomChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {currentPatientSymptomChart.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              )}
            </div>

            {/* Lista de Atrasos */}
            {currentPatientMetrics.delays.length > 0 && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <strong>⚠️ Etapas em Atraso:</strong>
                <ul style={{ margin: "0.5rem 0 0 1.5rem", padding: 0 }}>
                  {currentPatientMetrics.delays.map((delay, i) => (
                    <li key={i}>{delay}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 🚨 SEÇÃO DE AÇÕES CRÍTICAS (GERAL) */}
        {criticalMetrics && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Atrasos nas Etapas */}
            <div
              style={{
                background: criticalMetrics.totalDelays > 0 ? "#fef2f2" : "#f0fdf4",
                border: criticalMetrics.totalDelays > 0 ? "2px solid #ef4444" : "2px solid #10b981",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <Clock size={32} color={criticalMetrics.totalDelays > 0 ? "#ef4444" : "#10b981"} />
              <div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Atrasos de Etapa (7+ dias)</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: criticalMetrics.totalDelays > 0 ? "#ef4444" : "#10b981" }}>
                  {criticalMetrics.totalDelays}
                </div>
              </div>
            </div>

            {/* Alertas Críticos */}
            <div
              style={{
                background: criticalMetrics.criticalAlerts > 0 ? "#fef2f2" : "#f0fdf4",
                border: criticalMetrics.criticalAlerts > 0 ? "2px solid #dc2626" : "2px solid #10b981",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <AlertTriangle size={32} color={criticalMetrics.criticalAlerts > 0 ? "#dc2626" : "#10b981"} />
              <div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Pacientes em Alerta</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: criticalMetrics.criticalAlerts > 0 ? "#dc2626" : "#10b981" }}>
                  {criticalMetrics.criticalAlerts}
                </div>
              </div>
            </div>

            {/* Exames Pendentes */}
            <div
              style={{
                background: criticalMetrics.pendingExams > 0 ? "#fef3c7" : "#f0fdf4",
                border: criticalMetrics.pendingExams > 0 ? "2px solid #f59e0b" : "2px solid #10b981",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <FileText size={32} color={criticalMetrics.pendingExams > 0 ? "#f59e0b" : "#10b981"} />
              <div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Exames Pendentes</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: criticalMetrics.pendingExams > 0 ? "#f59e0b" : "#10b981" }}>
                  {criticalMetrics.pendingExams}
                </div>
              </div>
            </div>

            {/* Total de Pacientes */}
            <div
              style={{
                background: "#eff6ff",
                border: "2px solid #3b82f6",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <Activity size={32} color="#3b82f6" />
              <div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Total de Pacientes</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}>
                  {criticalMetrics.totalPatients}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de filtro - sexo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
          <button style={buttonStyle("M")} onClick={() => setSelectedGender?.("M")}>
            Homem
          </button>
          <button style={buttonStyle("F")} onClick={() => setSelectedGender?.("F")}>
            Mulher
          </button>
          <button style={buttonStyle("all")} onClick={() => setSelectedGender?.("all")}>
            Todos
          </button>
        </div>

        {/* Botões de filtro - idades */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
          {AGE_BUCKETS.map((b) => {
            const active = ageFilters.has(b.key);
            return (
              <button
                key={b.key}
                onClick={() => toggleAgeFilter(b.key)}
                style={ageButtonStyle(active)}
                title={`Filtrar ${b.label}`}
              >
                {b.label}
              </button>
            );
          })}
          <button
            onClick={() => setAgeFilters(new Set())}
            style={{
              padding: "0.4rem 0.65rem",
              margin: "0 0.25rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#000",
              background: "#f3f4f6",
            }}
            title="Limpar filtros de idade"
          >
            Limpar Idade
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          {/* Estadiamento */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "300px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#000" }}>Estadiamento</h3>
            <PieChart width={450} height={300}>
              <Pie data={estadiamentoForChart} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={100} label>
                {estadiamentoForChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </div>

          {/* Tipo de Câncer */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "300px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#000" }}>Tipo de Câncer</h3>
            <PieChart width={550} height={300}>
              <Pie data={tipoCancerForChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {tipoCancerForChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </div>

          {/* Status da Jornada */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "400px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#000" }}>Status da Jornada</h3>
            <BarChart width={550} height={300} data={statusJornadaForChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#000" }} />
              <YAxis tick={{ fill: "#000" }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" name="Pacientes" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;