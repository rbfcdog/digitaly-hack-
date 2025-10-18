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
