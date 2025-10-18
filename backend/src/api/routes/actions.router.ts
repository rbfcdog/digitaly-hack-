import { Router } from "express";

import { ActionsController } from "../controllers/actions.controller.js";

const router = Router();

router.post("/foo", ActionsController.foo);

export default router;