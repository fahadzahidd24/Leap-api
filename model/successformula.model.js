import mongoose from "mongoose";

const successformulaSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    date: { type: Date, required: true },
    prospectingapproach: {
        total: { type: Number, required: true },
        achieved: { type: Number, required: true, default: 0 }
    },
    appointmentskept: {
        total: { type: Number, required: true },
        achieved: { type: Number, required: true, default: 0 }
    },
    salessubmitted: {
        total: { type: Number, required: true },
        achieved: { type: Number, required: true, default: 0 }
    }
});

// Ensure that there is only one entry per user per date
successformulaSchema.index({ userId: 1, date: 1 }, { unique: true });

const SuccessFormula = mongoose.model("SuccessFormula", successformulaSchema);

export default SuccessFormula;
