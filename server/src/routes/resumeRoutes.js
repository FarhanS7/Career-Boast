import express from "express";
import {
    getResume,
    improveResume,
    saveResume,
} from "../controllers/resumeController.js";
import { improveResumeSchema, resumeSchema } from "../lib/schema.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";

const router = express.Router();

// Save or update user resume
router.post("/", requireAuth, validateSchema(resumeSchema), saveResume);

// Fetch user resume
router.get("/", requireAuth, getResume);

// AI improvement for resume
router.post("/improve", requireAuth, validateSchema(improveResumeSchema), improveResume);

export default router;
