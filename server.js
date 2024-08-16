import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import DB from "./config/db/config.js";
import authRoutes from "./router/auth.route.js";
import entriesRoutes from "./router/entries.route.js";
import pasRoutes from "./router/pas.router.js";

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

  // Listen for chat messages
  socket.on("chatMessage", (messageData) => {
    console.log(`Message from ${socket.id}:`, messageData);
    // Broadcast the message to all connected clients (or you can target specific users)
    io.emit("receiveMessage", messageData);
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
app.use("/api", authenticate, entriesRoutes);
app.use("/api", authenticate, pasRoutes);

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
