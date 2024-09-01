import SuccessFormula from "../model/successformula.model.js";
import SalesTargets from "../model/salestargets.model.js";
import { getCurrentDate } from "../utils/Date.js";
import { calculatePAS } from "../utils/calculatePAS.js";

// Create a new success formula and sales target
export const createEntries = async (req, res) => {
  try {
    const {
      salesTargets,
      averageCaseSize,
      numberOfWeeks,
      prospectingApproach,
      appointmentsKept,
      salesSubmitted,
    } = req.body;
    const userId = req.user._id;

    // Create a new success formula
    const newSuccessFormula = new SuccessFormula({
      userId,
      appointmentsKept,
      prospectingApproach,
      salesSubmitted,
    });

    // Create a new sales target
    const newSalesTarget = new SalesTargets({
      userId,
      averageCaseSize,
      salesTargets,
      numberOfWeeks,
    });

    // Save to the database
    const savedSuccessFormula = await newSuccessFormula.save();
    const savedSalesTarget = await newSalesTarget.save();

    const {
      __v: bs,
      _id: dd,
      userId: vv,
      ...salesLeft
    } = savedSalesTarget._doc;
    const { __v, _id, userId: xx, ...successLeft } = savedSuccessFormula._doc;

    const { daily_goals, weekly_goals } = calculatePAS(
      salesTargets,
      averageCaseSize,
      numberOfWeeks,
      prospectingApproach,
      appointmentsKept,
      salesSubmitted
    );

    return res.status(201).json({
      success: true,
      entries: {
        SuccessFormula: successLeft,
        SalesTargets: salesLeft,
        weekly_goals,
        daily_goals,
      },
    });
  } catch (error) {
    console.error("Error creating entries:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get the success formula and sales targets for the current date for the user
export const getEntries = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from req.user

    const successFormula = await SuccessFormula.findOne({ userId });
    const salesTargets = await SalesTargets.findOne({ userId });

    if (salesTargets && successFormula) {
      const { __v: bs, _id: dd, userId: vv, ...salesLeft } = salesTargets._doc;
      const { __v, _id, userId: xx, ...successLeft } = successFormula._doc;

      const { daily_goals, weekly_goals } = calculatePAS(
        salesLeft.salesTargets,
        salesLeft.averageCaseSize,
        salesLeft.numberOfWeeks,
        successLeft.prospectingApproach,
        successLeft.appointmentsKept,
        successLeft.salesSubmitted
      );

      return res.status(200).json({
        success: true,
        entries: {
          SuccessFormula: successLeft,
          SalesTargets: salesLeft,
          weekly_goals,
          daily_goals,
        },
      });
    }

    return res.status(200).json({
      success: true,
      entries: {
        SuccessFormula: {},
        SalesTargets: {},
        weekly_goals: {},
        daily_goals: {},
      },
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Update the success formula and sales targets for the current date
export const updateEntries = async (req, res) => {
  try {
    const {
      salesTargets,
      averageCaseSize,
      numberOfWeeks,
      prospectingApproach,
      appointmentsKept,
      salesSubmitted,
    } = req.body;
    const userId = req.user._id; // Get userId from req.user

    const updatedSuccessFormula = await SuccessFormula.findOneAndUpdate(
      { userId },
      {
        $set: {
          prospectingApproach,
          appointmentsKept,
          salesSubmitted,
        },
      },
      { new: true }
    );

    if (!updatedSuccessFormula) {
      return res
        .status(404)
        .json({ success: false, message: "Success formula not found" });
    }

    // Find and update the sales targets by user ID
    const updatedSalesTarget = await SalesTargets.findOneAndUpdate(
      { userId },
      { salesTargets, averageCaseSize, numberOfWeeks },
      { new: true }
    );

    if (!updatedSalesTarget) {
      return res
        .status(404)
        .json({ success: false, message: "Sales target not found" });
    }

    const {
      __v: bs,
      _id: dd,
      userId: vv,
      ...salesLeft
    } = updatedSalesTarget._doc;
    const { __v, _id, userId: xx, ...successLeft } = updatedSuccessFormula._doc;

    const { daily_goals, weekly_goals } = calculatePAS(
      salesLeft.salesTargets,
      salesLeft.averageCaseSize,
      salesLeft.numberOfWeeks,
      successLeft.prospectingApproach,
      successLeft.appointmentsKept,
      successLeft.salesSubmitted
    );

    return res.status(201).json({
      success: true,
      entries: {
        SuccessFormula: successLeft,
        SalesTargets: salesLeft,
        weekly_goals,
        daily_goals,
      },
    });
  } catch (error) {
    console.error("Error updating entries:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
