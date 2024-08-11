import PAS from "../model/pas.model.js";
import moment from 'moment';


export const setPAS = async (req, res) => {
    try {
        const { p_daily, a_daily, s_daily, date } = req.body;
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
                s_daily: []
            });
        }

        // Update the appropriate field
        if (p_daily !== undefined) pasDocument.p_daily = p_daily;
        if (a_daily !== undefined) pasDocument.a_daily = a_daily;
        if (s_daily !== undefined) pasDocument.s_daily.push(s_daily);
        // Save the updated document
        const savedPAS = await pasDocument.save();

        const {
            __v,
            _id,
            userId: userIdRemoved,
            date: dateRemoved,
            ...pasLeft
        } = savedPAS._doc;

        const sumSDaily = pasLeft.s_daily.reduce((acc, curr) => acc + curr, 0);

        res.status(201).json({
            success: true,
            pas: { ...pasLeft, s_daily: pasLeft.s_daily, premium_daily: sumSDaily },
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
                    s_daily: [],
                    premium_daily: 0
                },
            });
        }

        // Exclude unwanted fields
        const { __v: bs, _id: dd, userId: vv, date: zz, ...pasLeft } = pas._doc;

        const sumSDaily = pasLeft.s_daily.reduce((acc, curr) => acc + curr, 0);

        res.status(201).json({
            success: true,
            pas: { ...pasLeft, s_daily: pasLeft.s_daily, premium_daily: sumSDaily },
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
        //date is like this DD/MM/YYYY
        const startDate = moment(date, 'DD/MM/YYYY').startOf('isoWeek'); // Parse and get start of the week
        const endDate = moment(date, 'DD/MM/YYYY').endOf('isoWeek'); // Parse and get end of the week

        // Convert dates back to strings to match the database format
        const startDateString = startDate.format('DD/MM/YYYY');
        const endDateString = endDate.format('DD/MM/YYYY');

        const entries = await PAS.find({
            userId: userId,
            date: {
                $gte: startDateString,
                $lte: endDateString,
            },
        });

        // Initialize sum variables
        let p_weekly = 0;
        let a_weekly = 0;
        let s_weekly = 0;
        let totalPremiumWeekly = 0;

        // Sum the values of p_weekly, a_weekly, and s_weekly
        entries.forEach(entry => {
            p_weekly += entry.p_daily || 0;
            a_weekly += entry.a_daily || 0;
            s_weekly += entry.s_daily.length || 0;
            totalPremiumWeekly += entry.s_daily.reduce((acc, curr) => acc + curr, 0);
        });

        // Return the calculated PAS
        return res.status(200).json({
            success: true,
            pas: {
                p_weekly,
                a_weekly,
                s_weekly,
                totalPremiumWeekly
            },
        });
    } catch (error) {
        console.error("Error fetching weekly PAS:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAnnualPAS = async (req, res) => {
    try {
        const userId = req.user._id; // Get userId from req.user

        // Aggregate to sum the premium_daily values for the specific user
        const result = await PAS.aggregate([
            { $match: { userId } }, // Match documents with the specific userId
            {
                $group: {
                    _id: null,
                    totalPremiumYearly: { $sum: { $sum: "$s_daily" } },
                    p_yearly: { $sum: "$p_daily" },
                    a_yearly: { $sum: "$a_daily" },
                    s_yearly: { $sum: { $size: "$s_daily" } },
                },
            }, // Sum the premium_daily values
        ]);

        // Extract the total value
        const totalPremiumYearly = result.length > 0 ? result[0].totalPremiumYearly : 0;
        const p_yearly = result.length > 0 ? result[0].p_yearly : 0;
        const a_yearly = result.length > 0 ? result[0].a_yearly : 0;
        const s_yearly = result.length > 0 ? result[0].s_yearly : 0;

        res.status(200).json({
            success: true,
            pas: {
                totalPremiumYearly,
                p_yearly,
                a_yearly,
                s_yearly,
                total_days: result.length || 0
            },
        });
    } catch (error) {
        console.error("Error fetching total premium daily:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const editDailyPAS = async (req, res) => {
    try {
        const { index, s_daily, date } = req.body;
        const userId = req.user._id;

        console.log(req.body)

        // Find if there is an existing document with the provided date and userId
        let pasDocument = await PAS.findOne({ userId, date });

        // Update or remove the value at the specified index
        if (s_daily == 0) {
            // Remove the index from s_daily array if s_daily is 0
            pasDocument.s_daily.splice(index, 1);
        } else {
            // Update the value at the specified index
            pasDocument.s_daily[index] = s_daily;
        }

        // Save the updated document
        const savedPAS = await pasDocument.save();

        const {
            __v,
            _id,
            userId: userIdRemoved,
            date: dateRemoved,
            ...pasLeft
        } = savedPAS._doc;

        const sumSDaily = pasLeft.s_daily.reduce((acc, curr) => acc + curr, 0);

        res.status(201).json({
            success: true,
            pas: { ...pasLeft, s_daily: pasLeft.s_daily, premium_daily: sumSDaily },
        });
    } catch (error) {
        console.error("Error setting PAS:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
