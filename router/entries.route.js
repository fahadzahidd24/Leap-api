import express from "express";
import {
  createEntries,
  getEntries,
  updateEntries,
} from "../controller/Entries.controller.js";

const router = express.Router();

router.post("/entries", createEntries);
router.get("/entries", getEntries);
router.get("/entries/:agentId", getEntries);
router.put("/entries", updateEntries);

export default router;
