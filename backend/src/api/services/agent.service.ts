import 'dotenv/config';
import OpenAI from 'openai';
import { z } from 'zod';
import type { PatientAnalysis, ClientInfo, Message } from '../../types/index.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Updated schema with "important_info" field
export const PatientAnalysisSchema = z.object({
  patient_id: z.string(),
  sintomas: z.array(z.string()),
  observacoes: z.string(),
  sugestao_plano: z.string(),
  important_info: z.array(z.string()), // new field
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

    console.log("Patient info:", patientInfoText);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `Você é um assistente médico especializado que analisa conversas entre médico e paciente.
Use **todas as informações disponíveis do paciente** (como idade, sexo, diagnóstico, histórico de tratamentos, datas de consultas, tipo de câncer, estágio, etc.) e **todas as mensagens trocadas** para gerar um relatório completo.
Retorne sempre um JSON válido.`
        },
        {
          role: 'user',
          content: `
Informações do paciente:
${patientInfoText}

Analise cuidadosamente estas informações e a conversa abaixo. Gere conclusões sobre:
- Principais sintomas apresentados
- Observações importantes para o acompanhamento
- Sugestão de plano de ação

Além disso, indique **quais dados recebidos (tanto mensagens quanto informações do paciente) foram mais importantes para chegar a estas conclusões**. 
Liste essas informações em um campo chamado "important_info".
Deve constar exatamente as mensagens que foram mais relevantes da forma em que foram escritas, além de informações do paciente (somente as relevantes, como o tipo de cancer, ).
NÂO inclua informações irrelevantes ou que não contribuíram para a análise, como patient_id, nome, idade, etc, conste apenas tipo de cancer.

Conversa:
"""
${combinedText}
"""

Retorne um JSON no seguinte formato estrito:

{
  "patient_id": "...",
  "sintomas": [...],
  "observacoes": "...",
  "sugestao_plano": "...",
  "important_info": ["..."] 
}`
        }
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
              sintomas: { type: 'array', items: { type: 'string' } },
              observacoes: { type: 'string' },
              sugestao_plano: { type: 'string' },
              important_info: { type: 'array', items: { type: 'string' } }, // new field
            },
            required: ['patient_id', 'sintomas', 'observacoes', 'sugestao_plano', 'important_info'],
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
