import express from "express";
import { getDashboardStats, getIndustryInsights } from "../controllers/dashboardController.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Fetch AI-generated industry insights for dashboard
router.get("/industry-insights", requireAuth, getIndustryInsights);

// Fetch quick stats for dashboard
router.get("/stats", requireAuth, getDashboardStats);

export default router;
