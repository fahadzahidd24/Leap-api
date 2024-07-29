import { Router } from "express";
import { createSuccessFormula, getSuccessFormula, updateSuccessFormula } from "../controller/successformula.controller.js";

const router = Router();

router.post("/successformula", createSuccessFormula);
router.get("/successformula", getSuccessFormula);
router.put("/successformula", updateSuccessFormula);

export default router;
