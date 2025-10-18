import { Router } from "express";
import { ActionsController } from "../controllers/actions.controller.js";

const router = Router();

router.post("/foo", ActionsController.foo);
router.post("/query-client-info", ActionsController.queryClientInfo);
router.post("/create-session", ActionsController.createSession);


export default router;
