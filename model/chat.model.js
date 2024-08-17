import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  participants: [{ type: String, ref: "User", required: true }],
  messages: [
    {
      sender: {
        type: String,
        ref: "User",
        required: true,
      },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  lastMessage: {
    content: { type: String },
    timestamp: { type: Date },
  },
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
