import 'dotenv/config';
import OpenAI from 'openai';
import { z } from 'zod';
import type { PatientAnalysis, ClientInfo, Message } from '../../types/index.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Updated schema
export const PatientAnalysisSchema = z.object({
  patient_id: z.string(),
  sintomas: z.array(z.object({ sintoma: z.string(), gravidade: z.enum(['leve', 'medio', 'grave', 'gravissimo']) })),
  observacoes: z.string(),
  sugestao_plano: z.string(),
  alertas_risco: z.array(z.object({ alerta: z.string(), nivel_alerta: z.enum(['leve', 'medio', 'grave', 'gravissimo']) })),
});

export class AgentService {
  static async analyzePatientConversation(
    messages: Message[],
    patient_info: ClientInfo
  ): Promise<PatientAnalysis> {
    const combinedText = messages
      .map((m) => `${m.sender_role.toUpperCase()}: ${m.message}`)
      .join('\n');

    const patientInfoText = JSON.stringify(patient_info, null, 2);

    const systemPrompt = `Você é um assistente médico especializado em pacientes oncológicos.
Use **todas as informações do paciente** (tipo de câncer, estágio, histórico de tratamentos, consultas etc.) e **todas as mensagens do paciente** para gerar um relatório completo.
Os sintomas devem ser classificados com um nível de gravidade baseado no tipo de câncer do paciente.
Crie alertas de risco com níveis: leve, medio, grave ou gravissimo, considerando sintomas, exames e condições do paciente.
Retorne sempre um JSON válido.`;

    const userPrompt = `
Informações do paciente:
${patientInfoText}

Analise cuidadosamente estas informações e a conversa abaixo. Gere conclusões sobre:
- Principais sintomas apresentados e sua gravidade (leve, medio, grave, gravissimo)
- Observações detalhadas com base em TODO o histórico do paciente, levante a analise relacionando ao tipo de câncer 
- Sugestão de plano de ação considerando histórico e tipo de câncer
- Alertas de risco com nível de alerta, o alerta deve ser medido em relação ao tipo de câncer e histórico do paciente, qualquer informação relevante deve ser considerada

Escreva com a primeira letra da palavra inicial em maiúscula.

Conversa:
"""
${combinedText}
"""

Retorne um JSON no seguinte formato estrito:

{
  "patient_id": "...",
  "sintomas": [{"sintoma": "...", "gravidade": "..."}],
  "observacoes": "...",
  "sugestao_plano": "...",
  "alertas_risco": [{"alerta": "...", "nivel_alerta": "..."}]
}`;

    console.log('User Prompt:', userPrompt); // Debugging line

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'patient_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              patient_id: { type: 'string' },
              sintomas: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    sintoma: { type: 'string' },
                    gravidade: { type: 'string', enum: ['leve', 'medio', 'grave', 'gravissimo'] },
                  },
                  required: ['sintoma', 'gravidade'],
                  additionalProperties: false, // <-- ESSENCIAL
                },
              },
              observacoes: { type: 'string' },
              sugestao_plano: { type: 'string' },
              alertas_risco: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    alerta: { type: 'string' },
                    nivel_alerta: { type: 'string', enum: ['leve', 'medio', 'grave', 'gravissimo'] },
                  },
                  required: ['alerta', 'nivel_alerta'],
                  additionalProperties: false, // <-- ESSENCIAL
                },
              },
            },
            required: ['patient_id', 'sintomas', 'observacoes', 'sugestao_plano', 'alertas_risco'],
            additionalProperties: false,
          },
        },
      },
    });

    const result = completion.choices[0].message?.content;
    if (!result) throw new Error('Agente não retornou resposta');

    const parsed = JSON.parse(result);
    return PatientAnalysisSchema.parse(parsed);
  }
}

export const agentService = AgentService;
