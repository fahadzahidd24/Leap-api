import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import DB from "./config/db/config.js";
import authRoutes from "./router/auth.route.js";
import entriesRoutes from "./router/entries.route.js";
import chatRoutes from "./router/chat.route.js";
import pasRoutes from "./router/pas.router.js";
import eventRoutes from "./router/event.route.js";
import Chat from "./model/chat.model.js";

import { config } from "dotenv";
import { authenticate } from "./middleware/authenticate.js";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for location updates from agents
  socket.on("agentLocation", (locationData) => {
    console.log(`Location received from ${socket.id}:`, locationData);
    // Broadcast location to all connected managers
    io.emit("managerReceiveLocation", locationData);
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
app.use("/api", authRoutes);
app.use("/api", eventRoutes);
app.use("/api", authenticate, chatRoutes);
app.use("/api", authenticate, entriesRoutes);
app.use("/api", authenticate, pasRoutes);

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
