import { Request, Response } from "express";
import { agentService } from "../services/agent.service.js";

export class ActionsController {
  static async foo(req: Request, res: Response) {
    try {
      res.status(200).json({
        message: "foo",
        info: "Rota de teste funcionando corretamente"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }


  static async testAgent(req: Request, res: Response) {
    try {
      const { patient_id, messages } = req.body;

      if (!patient_id || !messages) {
        return res.status(400).json({ error: "Parâmetros obrigatórios: patient_id e messages" });
      }

      const result = await agentService.analyzePatientConversation(patient_id, messages);
      res.status(200).json(result);

    } catch (error: any) {
      console.error("Erro no agente:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
}


