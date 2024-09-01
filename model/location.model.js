import mongoose from "mongoose";

const agentLocationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  agentId: { type: mongoose.Types.ObjectId, required: true },
  agentName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  profilePic: {
    type: String,
    required: true,
  },
});

const AgentLocation = mongoose.model("AgentLocation", agentLocationSchema);

export default AgentLocation;
