import express from "express";
import {
    checkATSScore,
    deleteResume,
    getResume,
    getResumeById,
    improveResume,
    saveResume,
    shareResume,
    updateResume,
} from "../controllers/resumeController.js";
import { atsScoreSchema, improveResumeSchema, resumeSchema } from "../lib/schema.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";

const router = express.Router();

// Get all resumes for user
router.get("/", requireAuth, getResume);

// Create new resume
router.post("/", requireAuth, validateSchema(resumeSchema), saveResume);

// Get resume by ID
router.get("/:id", requireAuth, getResumeById);

// Update resume by ID
router.put("/:id", requireAuth, validateSchema(resumeSchema), updateResume);

// Delete resume by ID
router.delete("/:id", requireAuth, deleteResume);

// Generate share link
router.post("/:id/share", requireAuth, shareResume);

// AI improvement for resume
router.post("/:id/improve", requireAuth, validateSchema(improveResumeSchema), improveResume);

// Check ATS score for resume
router.post("/ats-score", requireAuth, validateSchema(atsScoreSchema), checkATSScore);

export default router;
