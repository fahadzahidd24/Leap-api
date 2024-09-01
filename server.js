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
import improvementPlansRoutes from "./router/improvementPlans.route.js";

import Chat from "./model/chat.model.js";
import RefreshTokens from "./model/refreshTokens.model.js";

import { config } from "dotenv";
import { authenticate } from "./middleware/authenticate.js";
import { google } from "googleapis";

import { createServer } from "http";
import { Server } from "socket.io";
import User from "./model/User.model.js";
import Event from "./model/event.model.js";

import path from "path";
import { fileURLToPath } from "url";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// defining the endpoints

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = `${process.env.SERVER_URL}/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

async function refreshAccessToken(refreshToken) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token;
}

app.get("/api/fetch-events/:userId", authenticate, async (req, res) => {
  try {
    // Assume you have stored the user's refresh token securely

    const userId = req.params.userId;

    const events = await Event.find({ userId: req.params.userId });

    const tokenData = await RefreshTokens.findOne({ userId });

    if (tokenData) {
      // Get a new access token using the refresh token
      const accessToken = await refreshAccessToken(tokenData.refreshToken);
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      const googleEvents = await calendar.events.list({
        calendarId: "primary",
        orderBy: "startTime",
      });

      const transformedData = googleEvents?.data?.items?.map((event) => ({
        title: event?.summary,
        description: event?.description,
        startTime: event?.start?.dateTime,
        endTime: event?.end?.dateTime,
        status: event?.status,
        source: "google",
      }));

      const combinedEvents = [...transformedData, ...events];

      return res.status(200).json(combinedEvents);
    }
    return res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).send("Error retrieving events");
  }
});

app.get("/api/auth/google", authenticate, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { redirect } = req.query;
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar.readonly"],
      prompt: "consent",
      state: `${userId},${redirect}`,
    });
    return res.json({ authUrl });
  } catch (error) {
    console.error("Error generating url", error);
    return res.status(400).json({
      success: false,
      message: "An error occurred while creating auth url",
    });
  }
});

app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const [userId, redirect] = state.split(",");
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { refresh_token } = tokens;

    if (refresh_token) {
      const refreshToken = new RefreshTokens({
        userId,
        refreshToken: refresh_token,
      });
      await refreshToken.save();
      return res.redirect(`${redirect}?state=true`);
    } else {
      throw new Error("Unable to retrieve access token");
    }
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    return res.redirect(`${redirect}?state=false`);
  }
});

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

    return res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return res.status(400).json({ message: "Error fetching agents", error });
  }
});

app.use("/api", authRoutes);
app.use("/api", eventRoutes);
app.use("/api", authenticate, chatRoutes);
app.use("/api", authenticate, entriesRoutes);
app.use("/api", authenticate, pasRoutes);
app.use("/api", authenticate, locationRoutes);
app.use("/api/improvementplan", authenticate, improvementPlansRoutes);

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
