import mongoose from "mongoose";

const pasSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    date: { type: String },
    p_daily: {
        type: Number,
        default: 0
    },
    a_daily: {
        type: Number,
        default: 0
    },
    s_daily: {
        type: Number,
        default: 0
    },
    premium_daily: {
        type: Number,
        default: 0
    }
});

const PAS = mongoose.model("PAS", pasSchema);

export default PAS;
