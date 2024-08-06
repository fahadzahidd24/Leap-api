import mongoose from "mongoose";

const successformulaSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    prospectingApproach: {
        type: Number,
        required: true,
    },
    appointmentsKept: {
        type: Number,
        required: true,
    },
    salesSubmitted: {
        type: Number,
        required: true,
    }
});

const SuccessFormula = mongoose.model("SuccessFormula", successformulaSchema);

export default SuccessFormula;
