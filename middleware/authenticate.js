import { config } from "dotenv";
import jwt from "jsonwebtoken";
import User from "../model/User.model.js";
config();

export const authenticate = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decode.userId);
      next();
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Invalid Authentication Token" });
    }
  } else {
    res
      .status(401)
      .json({ success: false, message: "Authentication Token not found" });
  }
};
