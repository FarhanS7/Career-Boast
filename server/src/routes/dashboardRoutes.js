import express from "express";
import { getIndustryInsights } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Fetch AI-generated industry insights for dashboard
router.get("/industry-insights", requireAuth, getIndustryInsights);

export default router;
