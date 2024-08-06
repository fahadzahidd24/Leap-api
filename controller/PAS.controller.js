import PAS from "../model/pas.model.js";
import { parseISO, startOfDay } from "date-fns";
import { addDays, isWithinInterval } from "date-fns";

const generateChunks = (startDate, chunkSize) => {
    const chunks = [];
    let currentStartDate = startDate;

    while (true) {
        const chunk = {
            start: currentStartDate,
            end: addDays(currentStartDate, chunkSize - 1),
        };
        chunks.push(chunk);
        currentStartDate = addDays(currentStartDate, chunkSize);

        // Break if we have generated enough chunks or if the current start date is in the future
        if (currentStartDate > new Date()) {
            break;
        }
    }

    return chunks;
};

const findCurrentChunk = (chunks, currentDate) => {
    return chunks.find((chunk) =>
        isWithinInterval(currentDate, { start: chunk.start, end: chunk.end })
    );
};

export const setPAS = async (req, res) => {
    try {
        const { p_daily, a_daily, s_daily, premium_daily, date } = req.body;
        const userId = req.user._id;

        // Find if there is an existing document with the provided date and userId
        let pasDocument = await PAS.findOne({ userId, date });

        if (!pasDocument) {
            // If no document exists, create one with default values
            pasDocument = new PAS({
                userId,
                date,
                p_daily: 0,
                a_daily: 0,
                s_daily: 0,
                premium_daily: 0,
            });
        }

        // Update the appropriate field
        if (p_daily !== undefined) pasDocument.p_daily = p_daily;
        if (a_daily !== undefined) pasDocument.a_daily = a_daily;
        if (s_daily !== undefined) pasDocument.s_daily = s_daily;
        if (premium_daily !== undefined) pasDocument.premium_daily = premium_daily;
        // Save the updated document
        const savedPAS = await pasDocument.save();

        const {
            __v,
            _id,
            userId: userIdRemoved,
            date: dateRemoved,
            ...pasLeft
        } = savedPAS._doc;

        res.status(201).json({
            success: true,
            pas: pasLeft,
        });
    } catch (error) {
        console.error("Error setting PAS:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get the success formula and sales targets for the current date for the user
export const getDailyPAS = async (req, res) => {
    try {
        const { date } = req.query;

        const userId = req.user._id; // Get userId from req.user

        // Find the document based on date and userId
        const pas = await PAS.findOne({ userId, date });

        if (!pas) {
            return res.status(200).json({
                success: true,
                pas: {
                    p_daily: 0,
                    a_daily: 0,
                    s_daily: 0,
                },
            });
        }

        // Exclude unwanted fields
        const { __v: bs, _id: dd, userId: vv, date: zz, ...pasLeft } = pas._doc;

        res.status(200).json({
            success: true,
            pas: pasLeft,
        });
    } catch (error) {
        console.error("Error fetching daily pas:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getWeeklyPAS = async (req, res) => {
    try {
        const userId = req.user._id;
        const { date } = req.query;

        // Find the document based on date and userId

        return res.status(200).json({
            success: true,
            pas: {
                p_weekly: 0,
                a_weekly: 0,
                s_weekly: 0,
            },
        });
    } catch (error) {
        console.error("Error fetching weekly PAS:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

import mongoose from "mongoose";

export const getAnnualPAS = async (req, res) => {
    try {
        const userId = req.user._id; // Get userId from req.user

        // Aggregate to sum the premium_daily values for the specific user
        const result = await PAS.aggregate([
            { $match: { userId } }, // Match documents with the specific userId
            {
                $group: {
                    _id: null,
                    totalPremiumYearly: { $sum: "$premium_daily" },
                    p_yearly: { $sum: "$p_daily" },
                    a_yearly: { $sum: "$a_daily" },
                    s_yearly: { $sum: "$s_daily" },
                },
            }, // Sum the premium_daily values
        ]);

        // Extract the total value
        const totalPremiumYearly =
            result.length > 0 ? result[0].totalPremiumYearly : 0;
        const p_yearly =
            result.length > 0 ? result[0].p_yearly : 0;
        const a_yearly =
            result.length > 0 ? result[0].a_yearly : 0;
        const s_yearly =
            result.length > 0 ? result[0].s_yearly : 0;

        res.status(200).json({
            success: true,
            pas: {
                totalPremiumYearly,
                p_yearly,
                a_yearly,
                s_yearly
            },
        });
    } catch (error) {
        console.error("Error fetching total premium daily:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
