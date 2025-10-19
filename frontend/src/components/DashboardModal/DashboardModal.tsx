"use client";

import React, { useState, useMemo } from "react";
import type { ClientInfo } from "@/types";
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

interface DashboardModalProps {
  visible: boolean;
  onClose: () => void;
  estadiamentoData: { name: string; value: number }[];
  tipoCancerData: { name: string; value: number }[];
  statusJornadaData: { name: string; value: number }[];
  patientsAge: { name: string; value: number }[];

  patients?: ClientInfo[];

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

const AGE_BUCKETS: { key: string; label: string; test: (age?: number) => boolean }[] = [
  { key: "0-18", label: "0-18", test: (a) => typeof a === "number" && a <= 18 },
  { key: "19-35", label: "19-35", test: (a) => typeof a === "number" && a >= 19 && a <= 35 },
  { key: "36-50", label: "36-50", test: (a) => typeof a === "number" && a >= 36 && a <= 50 },
  { key: "51-65", label: "51-65", test: (a) => typeof a === "number" && a >= 51 && a <= 65 },
  { key: "66+", label: "66+", test: (a) => typeof a === "number" && a >= 66 },
];

const DashboardModal: React.FC<DashboardModalProps> = ({
  visible,
  onClose,
  estadiamentoData,
  tipoCancerData,
  statusJornadaData,
  patientsAge,
  patients,
  selectedGender = "all",
  setSelectedGender,
}) => {
  if (!visible) return null;

   // idade: multi-select set de keys (ex: "19-35","36-50")
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

   // se recebeu raw patients, gera datasets filtrando por sexo + idade selecionadas
  const hasRaw = Array.isArray(patients) && patients.length > 0;

  const filteredPatients = useMemo(() => {
    if (!hasRaw) return [];
    return patients!.filter((p) => {
      // filtro por sexo vindo do pai
      if (selectedGender !== "all") {
        if (((p.sexo || "") as string).toUpperCase() !== selectedGender) return false;
      }
      // filtro por idade - se nenhum filtro de idade ativo, mantém
      if (ageFilters.size === 0) return true;
      const age = p.idade;
      // se não tem idade, considerar como não pertencente a buckets
      for (const key of ageFilters) {
        const bucket = AGE_BUCKETS.find((b) => b.key === key);
        if (bucket && bucket.test(age)) return true;
      }
      return false;
    });
  }, [patients, selectedGender, ageFilters, hasRaw]);

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
          width: "85%",
          maxWidth: "1200px",
          height: "80%",
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
          }}
        >
          Fechar
        </button>

        {/* Título do Dashboard */}
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

        {/* Botões de filtro - idades (multi-select) */}
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
          {/* botão para limpar filtros de idade */}
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
            <BarChart width={500} height={300} data={statusJornadaForChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#000" }} />
              <YAxis tick={{ fill: "#000" }} />
              <Tooltip />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ color: "#000" }}
                formatter={(value, entry) => {
                  const payloadName = (entry?.payload as any)?.name;
                  const item = statusJornadaForChart.find((d) => d.name === payloadName);
                  return item ? `${item.value} pessoas` : value;
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </div>

          {/* Idade */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "300px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#000" }}>Idade</h3>
            <PieChart width={450} height={300}>
              <Pie data={patientsAgeForChart} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={100} label>
                {patientsAgeForChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;