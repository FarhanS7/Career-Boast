import express from "express";
import {
    checkOrCreateUser,
    getMe,
    getOnboardingStatus,
    updateUser,
} from "../controllers/userController.js";
import { onboardingSchema } from "../lib/schema.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.get("/me", requireAuth, getMe);

router.post("/check", checkOrCreateUser);

// Update user profile and industry insight
router.put("/", requireAuth, validateSchema(onboardingSchema), updateUser);

// Check if user completed onboarding
router.get("/onboarding-status", requireAuth, getOnboardingStatus);

export default router;
