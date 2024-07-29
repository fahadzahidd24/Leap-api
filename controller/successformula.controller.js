import SuccessFormula from "../model/successformula.model.js";
import { getCurrentDate, getEndOfWeek, getStartOfWeek } from "../utils/Date.js";

export const createSuccessFormula = async (req, res) => {
  try {
    const { prospectingapproach, appointmentskept, salessubmitted } = req.body;
    const userId = req.user._id; // Get userId from req.user
    const date = getCurrentDate();

    // Create a new success formula
    const newSuccessFormula = new SuccessFormula({
      userId,
      date,
      prospectingapproach,
      appointmentskept,
      salessubmitted,
    });

    // Save to the database
    const savedSuccessFormula = await newSuccessFormula.save();

    res.status(201).json({ success: true, data: savedSuccessFormula });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({ success: false, message: "An entry for this date already exists." });
    } else {
      console.error("Error creating success formula:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
};

// Get the success formula for the current date for the user
export const getSuccessFormula = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from req.user
    const date = getCurrentDate();

    const successFormula = await SuccessFormula.findOne({ userId, date });

    res.status(200).json({ success: true, data: successFormula });
  } catch (error) {
    console.error("Error fetching success formula:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update the success formula for the current date
export const updateSuccessFormula = async (req, res) => {
  try {
    const { prospectingapproach, appointmentskept, salessubmitted } = req.body;
    const userId = req.user._id; // Get userId from req.user
    const date = getCurrentDate();

    // Find the success formula by user ID and date, then update it
    const updatedSuccessFormula = await SuccessFormula.findOneAndUpdate(
      { userId, date },
      { prospectingapproach, appointmentskept, salessubmitted },
      { new: true }
    );

    if (!updatedSuccessFormula) {
      return res.status(404).json({ success: false, message: "Success formula not found" });
    }

    res.status(200).json({ success: true, data: updatedSuccessFormula });
  } catch (error) {
    console.error("Error updating success formula:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCurrentWeekData = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from req.user
    const today = getCurrentDate();
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = getEndOfWeek(today);

    const weekData = await SuccessFormula.find({
      userId,
      date: { $gte: startOfWeek, $lte: endOfWeek }
    });

    res.status(200).json({ success: true, data: weekData });
  } catch (error) {
    console.error("Error fetching current week's data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};