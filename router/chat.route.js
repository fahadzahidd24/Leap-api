import express from "express";
import { getInbox, getMessages } from "../controller/Chat.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();
// Inbox route
router.get("/inbox", getInbox);

// Chat messages route
router.get("/chat/:userId1/:userId2", getMessages);

export default router;
