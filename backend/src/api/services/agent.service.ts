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

    const systemPrompt = `Você é um assistente médico especializado que analisa conversas entre médico e paciente.
Use **todas as informações disponíveis do paciente** (como idade, sexo, diagnóstico, histórico de tratamentos, datas de consultas, tipo de câncer, estágio, etc.) e **todas as mensagens trocadas** para gerar um relatório completo.
Retorne sempre um JSON válido.`;

    const userPrompt = `
Informações do paciente:
${patientInfoText}

Analise cuidadosamente estas informações e a conversa abaixo. Gere conclusões sobre:
- Principais sintomas apresentados
- Observações importantes para o acompanhamento
- Sugestão de plano de ação

Além disso, indique **quais mensagens foram mais importantes para chegar a estas conclusões**. 
Liste essas informações em um campo chamado "important_info", da MESMA FORMA em que elas foram mandadas pelo paciente.
Mostre apenas as mensagens do paciente que contribuíram para a análise, que realmente mostram condições dele, não inclua mensagens do médico.


Atualize sempre as suas respostas com base com mudancas no comportamento do paciente, caso ele apresente novos sintomas ou relate novas informações ou fale que outros sintomas ja existentes mudaram.
Caso ele fale que tenha falta de fome e depois que não tem mais, atualize a resposta removendo este sintoma.

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
}`;

    console.log('User Prompt:', userPrompt); // Debugging line

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
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
