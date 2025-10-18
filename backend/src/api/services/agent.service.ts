import 'dotenv/config';
import OpenAI from 'openai';
import { z } from 'zod';
import type { PatientAnalysis } from '../../types/index.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const PatientAnalysisSchema = z.object({
  patient_id: z.string(),
  sintomas: z.array(z.string()),
  observacoes: z.string(),
  sugestao_plano: z.string(),
});

export class AgentService {
  static async analyzePatientConversation(
    patient_id: string,
    messages: { role: string; content: string }[]
  ): Promise<PatientAnalysis> {
    const combinedText = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `Você é um assistente médico especializado que analisa conversas entre médico e paciente.
Retorne sempre um JSON válido com sintomas, observações e plano de ação.`,
        },
        {
          role: 'user',
          content: `
Analise a conversa abaixo e gere um JSON de acordo com o schema:

{
  "patient_id": "${patient_id}",
  "sintomas": [...],
  "observacoes": "...",
  "sugestao_plano": "..."
}

Conversa:
"""
${combinedText}
"""`,
        },
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
            },
            required: ['patient_id', 'sintomas', 'observacoes', 'sugestao_plano'],
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
