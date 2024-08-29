import { Router } from "express";
import {
  login,
  forgotPassword,
  signup,
} from "../controller/Auth.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, ".."); // Go one directory up
const uploadsDir = path.join(rootDir, "public/uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// const storage = multer.diskStorage({
//   filename: (req, file, cb) => {
//     // Set the filename to a unique name (e.g., user ID + original filename)
//     cb(null, `${req.body.email}`);
//   },
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Store files in 'public/uploads'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Use a timestamp and original file name
  },
});

const upload = multer({ storage });

router.post("/login", login);
router.post("/signup", upload.single("profilePic"), signup);
router.post("/forgotpassword", forgotPassword);

export default router;
