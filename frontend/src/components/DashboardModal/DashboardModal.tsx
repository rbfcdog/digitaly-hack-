"use client";

import React from "react";
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

const DashboardModal: React.FC<DashboardModalProps> = ({
  visible,
  onClose,
  estadiamentoData,
  tipoCancerData,
  statusJornadaData,
}) => {
  if (!visible) return null;

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
          gap: "2rem",
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          {/* Estadiamento */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "300px",
            }}
          >
            <h3 style={{ marginBottom: "1rem", color: "#000" }}>Estadiamento</h3>
            <PieChart width={350} height={300}>
              <Pie
                data={estadiamentoData}
                dataKey="value"
                nameKey="name"
                cx="40%"
                cy="50%"
                outerRadius={100}
                label
              >
                {estadiamentoData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </div>

          {/* Tipo de Câncer */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "300px",
            }}
          >
            <h3 style={{ marginBottom: "1rem", color: "#000" }}>Tipo de Câncer</h3>
            <PieChart width={550} height={300}>
              <Pie
                data={tipoCancerData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {tipoCancerData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </div>

          {/* Status da Jornada */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "400px",
            }}
          >
            <h3 style={{ marginBottom: "1rem", color: "#000" }}>Status da Jornada</h3>
            <BarChart width={500} height={300} data={statusJornadaData}>
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
                const item = statusJornadaData.find(d => d.name === entry?.payload?.name);
                return item ? `${item.value} pessoas` : value;
                }}
            />
            <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
