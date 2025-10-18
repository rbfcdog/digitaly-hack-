import { Router } from "express";
import { ActionsController } from "../controllers/actions.controller.js";

const router = Router();

router.post("/foo", ActionsController.foo);
router.post("/agent", ActionsController.testAgent); 
router.post("/query-client-info", ActionsController.queryClientInfo);

export default router;
