import { Router } from "express";
import {
  login,
  forgotPassword,
  signup,
} from "../controller/Auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/forgotpassword", forgotPassword);

export default router;
