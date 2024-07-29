import SalesTargets from "../model/salestargets.model.js";

// Create a new sales target
export const createSalesTarget = async (req, res) => {
  try {
    const { target, casesize, weeks } = req.body;
    const userId = req.user._id; // Get userId from req.user

    // Create a new sales target
    const newSalesTarget = new SalesTargets({
      userId,
      target,
      casesize,
      weeks,
    });

    // Save to the database
    const savedSalesTarget = await newSalesTarget.save();

    res.status(201).json({ success: true, data: savedSalesTarget });
  } catch (error) {
    console.error("Error creating sales target:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all sales targets
export const getSalesTargets = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from req.user
    const salesTargets = await SalesTargets.find({ userId });

    res.status(200).json({ success: true, data: salesTargets });
  } catch (error) {
    console.error("Error fetching sales targets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update a sales target
export const updateSalesTarget = async (req, res) => {
  try {
    const { target, casesize, weeks } = req.body;
    const userId = req.user._id; // Get userId from req.user

    // Find the sales target by ID and update it
    const updatedSalesTarget = await SalesTargets.findOneAndUpdate(
      { userId },
      { target, casesize, weeks },
      { new: true }
    );

    if (!updatedSalesTarget) {
      return res.status(404).json({ success: false, message: "Sales target not found" });
    }

    res.status(200).json({ success: true, data: updatedSalesTarget });
  } catch (error) {
    console.error("Error updating sales target:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
