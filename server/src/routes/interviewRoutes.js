import express from "express";
import {
    generateQuiz,
    listAssessments,
    saveQuizResult,
} from "../controllers/interviewController.js";
import { quizResultSchema } from "../lib/schema.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";

const router = express.Router();

// Generate quiz
router.get("/quiz", requireAuth, generateQuiz);

// Save quiz result
router.post("/quiz", requireAuth, validateSchema(quizResultSchema), saveQuizResult);

// Get all assessments (quiz history)
router.get("/assessments", requireAuth, listAssessments);

export default router;
