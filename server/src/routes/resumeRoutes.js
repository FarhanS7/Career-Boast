import express from "express";
import {
  getResume,
  improveResume,
  saveResume,
} from "../controllers/resume.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Save or update user resume
router.post("/", requireAuth, saveResume);

// Fetch user resume
router.get("/", requireAuth, getResume);

// AI improvement for resume
router.post("/improve", requireAuth, improveResume);

export default router;
