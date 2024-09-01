// routes/agentLocation.js
import { Router } from "express";
import AgentLocation from "../model/location.model.js";

const router = Router();

// POST: Add a new agent location
router.post("/location", async (req, res) => {
  try {
    const { latitude, longitude, agentId, agentName, companyName, profilePic } =
      req.body;

    // Find the existing location record by agentId
    let location = await AgentLocation.findOne({ agentId });

    if (location) {
      // Update the existing record
      location.latitude = latitude;
      location.longitude = longitude;

      await location.save();
      res
        .status(200)
        .json({ message: "Location updated successfully", location });
    } else {
      // Create a new location record if none exists
      location = new AgentLocation({
        latitude,
        longitude,
        agentId,
        agentName,
        companyName,
        profilePic,
      });

      await location.save();
      res
        .status(201)
        .json({ message: "Location saved successfully", location });
    }
  } catch (error) {
    console.error(error);
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
    return res.status(200).json(locations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve locations", error: error.message });
  }
});

export default router;
