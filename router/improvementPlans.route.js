import express from "express";
import {
  createImprovementPlan,
  getImprovementPlans,
  updateImprovementPlan,
  deleteImprovementPlan,
} from "../controller/improvementPlans.controller.js";

const router = express.Router();

// CREATE a new improvement plan
router.post("/", createImprovementPlan);

// READ all improvement plans for a user
router.get("/", getImprovementPlans);

// UPDATE an improvement plan
router.put("/:id", updateImprovementPlan);

// DELETE an improvement plan
router.delete("/:id", deleteImprovementPlan);

export default router;
