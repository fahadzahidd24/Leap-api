import ImprovementPlans from "../model/improvementPlans.model.js";

// CREATE: Add a new improvement plan
export const createImprovementPlan = async (req, res) => {
  try {
    const { title, subTitle, description } = req.body;
    const userId = req.user._id; // Assuming `req.user._id` has the userId

    const newPlan = new ImprovementPlans({
      userId,
      title,
      subTitle,
      description,
    });

    await newPlan.save();
    return res.status(201).json({ success: true, plan: newPlan });
  } catch (error) {
    console.error("Error creating improvement plan:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// READ: Get all improvement plans for a user
export const getImprovementPlans = async (req, res) => {
  try {
    const userId = req.user._id;

    const plans = await ImprovementPlans.find({ userId });

    return res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error("Error fetching improvement plans:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// UPDATE: Update an improvement plan
export const updateImprovementPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user._id;

    const updatedPlan = await ImprovementPlans.findOneAndUpdate(
      { _id: id, userId },
      { title, description },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Improvement plan not found" });
    }

    return res.status(200).json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error("Error updating improvement plan:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// DELETE: Delete an improvement plan
export const deleteImprovementPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deletedPlan = await ImprovementPlans.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Improvement plan not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Improvement plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting improvement plan:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
