import express from "express";
import {
  getOnboardingStatus,
  updateUser,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Update user profile and industry insight
router.put("/", requireAuth, updateUser);

// Check if user completed onboarding
router.get("/onboarding-status", requireAuth, getOnboardingStatus);

export default router;
