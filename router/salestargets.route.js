import { Router } from "express";
import { createSalesTarget, getSalesTargets, updateSalesTarget } from "../controller/salestargets.controller.js";

const router = Router();

router.post("/salestargets", createSalesTarget);
router.get("/salestargets", getSalesTargets);
router.put("/salestargets/:id", updateSalesTarget);

export default router;
