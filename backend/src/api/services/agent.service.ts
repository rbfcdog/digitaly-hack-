import 'dotenv/config';
import OpenAI from 'openai';
import { z } from 'zod';

// Inicializa cliente da OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//
// =========================
// 🧩 ZOD SCHEMAS
// =========================
//

// Schema de sintomas e plano de ação
export const PatientAnalysisSchema = z.object({
  patient_id: z.string().describe("Identificador único do paciente"),
  sintomas: z.array(z.string()).describe("Lista de sintomas identificados"),
  observacoes: z.string().describe("Resumo das observações clínicas relevantes"),
  sugestao_plano: z.string().describe("Sugestões de plano de ação para o médico"),
});

export type PatientAnalysis = z.infer<typeof PatientAnalysisSchema>;

// JSON Schema compatível com OpenAI
export const PatientAnalysisJSONSchema = {
  type: 'object',
  properties: {
    patient_id: { type: 'string' },
    sintomas: {
      type: 'array',
      items: { type: 'string' },
    },
    observacoes: { type: 'string' },
    sugestao_plano: { type: 'string' },
  },
  required: ['patient_id', 'sintomas', 'observacoes', 'sugestao_plano'],
  additionalProperties: false,
} as const;

//
// =========================
// 🩺 AGENTE DE ANÁLISE MÉDICA
// =========================
//

export class AgentService {
  /**
   * Analisa as mensagens entre médico e paciente e retorna um resumo estruturado
   */
  static async analyzePatientConversation(patient_id: string, messages: any[]): Promise<PatientAnalysis> {
    const combinedText = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `Você é um assistente médico especializado que analisa conversas entre médico e paciente.
          Sua tarefa é identificar sintomas, observações e propor um plano de ação breve.
          Sempre retorne o resultado em formato JSON válido de acordo com o schema.`,
        },
        {
          role: "user",
          content: `
Analise a conversa abaixo e gere o JSON com as seguintes chaves:
{
  "patient_id": "${patient_id}",
  "sintomas": [...],
  "observacoes": "...",
  "sugestao_plano": "..."
}

Conversa:
"""
${combinedText}
"""
`
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'patient_analysis',
          strict: true,
          schema: PatientAnalysisJSONSchema,
        },
      },
    });

    const result = completion.choices[0].message?.content;

    if (!result) {
      throw new Error("Agente não retornou resposta");
    }

    // Valida com Zod para garantir integridade
    const parsed = JSON.parse(result);
    return PatientAnalysisSchema.parse(parsed);
  }
}

export const agentService = AgentService;
