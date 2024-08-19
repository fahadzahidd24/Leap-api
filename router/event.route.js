// routes/eventRoutes.js

import express from "express";
import { getAllEvents } from "../controller/Event.controller.js";
import { getUserEvents } from "../controller/Event.controller.js";
import { createEvent } from "../controller/Event.controller.js";
import { updateEvent } from "../controller/Event.controller.js";
import { deleteEvent } from "../controller/Event.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Get all events
router.get("/events", getAllEvents);

// Get a single event by ID
router.get("/events/user", authenticate, getUserEvents);

// Create a new event
router.post("/event", authenticate, createEvent);

// Update an event
router.put("/events/:id", authenticate, updateEvent);

// Delete an event
router.delete("/events/:id", authenticate, deleteEvent);

export default router;
