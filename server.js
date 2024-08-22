import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import DB from "./config/db/config.js";
import authRoutes from "./router/auth.route.js";
import entriesRoutes from "./router/entries.route.js";
import chatRoutes from "./router/chat.route.js";
import pasRoutes from "./router/pas.router.js";
import locationRoutes from "./router/location.route.js";
import eventRoutes from "./router/event.route.js";
import Chat from "./model/chat.model.js";

import { config } from "dotenv";
import { authenticate } from "./middleware/authenticate.js";

import { createServer } from "http";
import { Server } from "socket.io";
import User from "./model/User.model.js";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for location updates from agents

  socket.on("joinCompanyRoom", (companyName) => {
    const normalizedCompanyName = companyName?.toLowerCase();
    socket.join(normalizedCompanyName);

    console.log(`Socket ${socket.id} joined room: ${normalizedCompanyName}`);
  });

  socket.on("agentLocation", (locationData) => {
    const normalizedCompanyName = locationData?.companyName?.toLowerCase();

    console.log(
      `Location received from ${socket.id} in ${normalizedCompanyName}:`,
      locationData
    );

    // Broadcast location to all connected managers
    io.to(normalizedCompanyName).emit("managerReceiveLocation", locationData);
  });

  socket.on("join", ({ userId1, userId2 }) => {
    const chatId = [userId1, userId2].sort().join("-");
    socket.join(chatId);
    console.log(`User ${userId1} and ${userId2} joined the room ${chatId}`);
  });

  socket.on("send_message", async ({ userId1, userId2, sender, content }) => {
    try {
      const chatId = [userId1, userId2].sort().join("-");

      let chat = await Chat.findOne({ chatId });

      if (!chat) {
        chat = new Chat({
          chatId,
          participants: [userId1, userId2],
          messages: [{ sender, content, timestamp: new Date() }],
          lastMessage: { content, timestamp: new Date() },
        });
      } else {
        chat.messages.push({ sender, content, timestamp: new Date() });
        chat.lastMessage = { content, timestamp: new Date() };
      }
      await chat.save();

      io.to(chatId).emit(
        "receive_message",
        chat.messages[chat.messages.length - 1]
      );
      console.log(`Message sent and emitted to room ${chatId}`);
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.id} due to ${reason}`);
  });
});

DB();
config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// defining the endpoints

app.get("/api/agents", authenticate, async (req, res) => {
  try {
    const companyName = req.user.companyName;

    // Find users within the same company with a role other than "supervisor"
    const users = await User.find({
      companyName: { $regex: new RegExp(`^${companyName}$`, "i") },
      role: { $ne: "supervisor" }, // Exclude supervisors
    }).select("_id fullName email");

    const userDetails = users.map((user) => ({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    }));

    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(400).json({ message: "Error fetching agents", error });
  }
});

app.use("/api", authRoutes);
app.use("/api", eventRoutes);
app.use("/api", authenticate, chatRoutes);
app.use("/api", authenticate, entriesRoutes);
app.use("/api", authenticate, pasRoutes);
app.use("/api", authenticate, locationRoutes);

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
