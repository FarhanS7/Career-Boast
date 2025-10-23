import express from "express";
import {
  generateQuiz,
  listAssessments,
  saveQuizResult,
} from "../controllers/interview.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Generate quiz
router.get("/quiz", requireAuth, generateQuiz);

// Save quiz result
router.post("/quiz", requireAuth, saveQuizResult);

// Get all assessments (quiz history)
router.get("/assessments", requireAuth, listAssessments);

export default router;
