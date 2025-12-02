import express from "express";
import multer from "multer";
import path from "path";
import * as resumeController from "../controllers/resumeController.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  },
});

// Upload resume
router.post("/upload", optionalAuth, upload.single("resume"), resumeController.uploadResume);

// Get all resumes for user
router.get("/", optionalAuth, resumeController.getResumes);

// Get single resume by ID
router.get("/:id", optionalAuth, resumeController.getResumeById);

// Delete resume
router.delete("/:id", optionalAuth, resumeController.deleteResume);

export default router;
