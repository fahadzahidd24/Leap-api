// routes/agentLocation.js
import { Router } from "express";
import AgentLocation from "../model/location.model.js";

const router = Router();

// POST: Add a new agent location
router.post("/location", async (req, res) => {
  try {
    const { latitude, longitude, agentId, agentName, companyName } = req.body;

    // Create a new AgentLocation document
    const newLocation = new AgentLocation({
      latitude,
      longitude,
      agentId,
      agentName,
      companyName,
    });

    // Save the location to the database
    await newLocation.save();

    res
      .status(201)
      .json({ message: "Location saved successfully", location: newLocation });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save location", error: error.message });
  }
});

router.get("/location", async (req, res) => {
  try {
    const { companyName } = req.query;
    let query = {};

    if (companyName) {
      query.companyName = companyName;
    }

    const locations = await AgentLocation.find(query).sort({ timestamp: -1 });
    res.status(200).json(locations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve locations", error: error.message });
  }
});

export default router;
