import express from "express";
import * as recommendController from "../controllers/recommendController.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Generate AI recommendations for a resume
router.post("/:resumeId", optionalAuth, recommendController.generateRecommendations);

// Get cached recommendations for a resume
router.get("/:resumeId", optionalAuth, recommendController.getRecommendations);

export default router;
