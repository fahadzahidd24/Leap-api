import mongoose from "mongoose";

const salestargetsSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, unique: true },
    salesTargets: { type: Number, required: true },
    averageCaseSize: {
        type: Number,
        required: true
    },
    numberOfWeeks: {
        type: Number,
        required: true,
    },
});

const SalesTargets = mongoose.model("SalesTargets", salestargetsSchema);

export default SalesTargets;
