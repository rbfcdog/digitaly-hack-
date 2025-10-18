import { Router } from "express";
import { ActionsController } from "../controllers/actions.controller.js";

const router = Router();

router.post("/foo", ActionsController.foo);
router.post("/agent", ActionsController.testAgent); 


router.post("/query-client-info", ActionsController.queryClientInfo);
router.post("/insert-message", ActionsController.insertMessage);
router.post("/query-all-client-messages", ActionsController.queryAllClientMessages);
router.post("/query-session-client-messages", ActionsController.querySessionClientMessages);

export default router;
