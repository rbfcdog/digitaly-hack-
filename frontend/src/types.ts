export interface ClientInfo {
  patient_id: string;
  nome_paciente: string;
  sexo: string;
  idade: number;
  diagnostico_data: string;
  tipo_cancer: string;
  estadiamento: string;
  cirurgia_data: string;
  quimioterapia_inicio: string;
  radioterapia_inicio: string;
  ultima_consulta: string;
  proxima_consulta: string;
  status_jornada: string;
  alerta_atraso: boolean;
  atraso_etapa: string;
}

export interface Message {
  id: string;                 // UUID
  session_id: string;         // session identifier
  sender_role: "doctor" | "patient"; // only these two possible values
  patient_id: string;         // patient identifier
  message: string;            // the actual message text
  created_at: string;         // ISO timestamp (from timestamptz)
}

export type NewMessage = Omit<Message, "id" | "created_at">;

// Tipo retornado pelo agente
export interface PatientAnalysis {
  patient_id: string;
  sintomas: string[];
  observacoes: string;
  sugestao_plano: string;
}