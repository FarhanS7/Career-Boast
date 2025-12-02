import express from "express";
import * as jobController from "../controllers/jobController.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all jobs with pagination and filters
router.get("/", optionalAuth, jobController.getJobs);

// Manually trigger job sync (for development/testing)
router.get("/sync", optionalAuth, jobController.syncJobs);

// Get single job by ID
router.get("/:id", optionalAuth, jobController.getJobById);

export default router;
