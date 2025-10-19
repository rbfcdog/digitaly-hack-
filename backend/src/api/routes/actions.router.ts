import { Router } from "express";
import { ActionsController } from "../controllers/actions.controller.js";

const router = Router();

router.post("/foo", ActionsController.foo);

router.post("/create-session", ActionsController.createSession);

router.post("/query-client-info", ActionsController.queryClientInfo);
router.post("/insert-message", ActionsController.insertMessage);
router.post("/query-all-client-messages", ActionsController.queryAllClientMessages);
router.post("/query-session-client-messages", ActionsController.querySessionClientMessages);

router.post("/agent-conversation", ActionsController.agentConversation);

export default router;
