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
  console.log(socket.id);

  socket.on("disconnect", (reason) => {
    console.log(`disconnect ${socket.id} due to ${reason}`);
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
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

httpServer.listen(PORT);

export default app;
