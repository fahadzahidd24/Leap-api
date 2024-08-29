import mongoose from "mongoose";

const improvementSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true },
  date: { type: String, default: Date.now() },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const ImprovementPlans = mongoose.model("ImprovementPlans", improvementSchema);

export default ImprovementPlans;
