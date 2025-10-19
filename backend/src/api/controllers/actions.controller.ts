import { Request, Response } from "express";
import crypto from "crypto";
import { agentService } from "../services/agent.service.js";
import { SessionsManager } from '../services/sessions.service.js';
import { supabaseService } from "../services/supabase.service.js";

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

static createSession(req: Request, res: Response) {
    const { patient_id } = req.body;
    if (!patient_id) return res.status(400).json({ error: "patient_id é obrigatório" });

    // Cria hash única para a sessão
    const hash = crypto.randomBytes(8).toString("hex");
    const sessionUrl = `${process.env.SERVER_URL || "http://localhost:3001"}/${hash}`;

    // Salva associação hash -> patient_id (em memória por enquanto)
    SessionsManager.addSession(hash, patient_id);

    return res.status(200).json({
      message: "Sessão criada com sucesso",
      url: sessionUrl,
      hash
    });
  }

  static async queryClientInfo(req: Request, res: Response) {
    try {
      const { clientId } = req.body;
      const clientInfo = await supabaseService.queryClientInfo(clientId);
      res.status(200).json(clientInfo);
    } catch (error: any) {
      console.error("Erro ao consultar informações do cliente:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async insertMessage(req: Request, res: Response) {
    try {
      const message = req.body;
      await supabaseService.insertMessage(message);
      res.status(200).json({ message: "Mensagem inserida com sucesso" });
    } catch (error: any) {
      console.error("Erro ao inserir mensagem:", error.message);
      res.status(500).json({ error: error.message });
    }

  }

  static async queryAllClientMessages(req: Request, res: Response) {
    try {
      const { patientId } = req.body;
      const messages = await supabaseService.queryAllClientMessages(patientId);
      res.status(200).json(messages);
    } catch (error: any) {
      console.error("Erro ao consultar mensagens do cliente:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
  
  static async querySessionClientMessages(req: Request, res: Response) {
    try {
      const { patientId, sessionId } = req.body;
      const messages = await supabaseService.querySessionClientMessages(patientId, sessionId);
      res.status(200).json(messages);
    } catch (error: any) {
      console.error("Erro ao consultar mensagens da sessão do cliente:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async agentConversation(req: Request, res: Response) {
    try {
      const { patient_id } = req.body;

      const messages = await supabaseService.queryAllClientMessages(patient_id);
      const patient_info = await supabaseService.queryClientInfo(patient_id);
      const analysis = await agentService.analyzePatientConversation(messages, patient_info);
      
      res.status(200).json(analysis);
    } catch (error: any) {
      console.error("Erro na conversa do agente:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
}


