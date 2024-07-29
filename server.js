import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import DB from "./config/db/config.js";
import authRoutes from "./router/auth.route.js";
import salestargetsRoutes from "./router/salestargets.route.js";
import successformulaRoutes from "./router/successformula.route.js";
import { config } from "dotenv";
import { authenticate } from "./middleware/authenticate.js";

const app = express();

DB();
config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// defining the endpoints
app.use("/api", authRoutes);
app.use("/api", authenticate, salestargetsRoutes);
app.use("/api", authenticate, successformulaRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
