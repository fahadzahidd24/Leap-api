import mongoose from "mongoose";

const salestargetsSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, unique: true },
    target: { type: Number, required: true },
    casesize: {
        type: Number,
        required: true
    },
    weeks: {
        type: Number,
        required: true,
    },
});

const SalesTargets = mongoose.model("SalesTargets", salestargetsSchema);

export default SalesTargets;
