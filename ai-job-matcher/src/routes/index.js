import express from "express";
import jobRoutes from "./jobRoutes.js";
import recommendRoutes from "./recommendRoutes.js";
import resumeRoutes from "./resumeRoutes.js";

const router = express.Router();

// Mount routes
router.use("/jobs", jobRoutes);
router.use("/resumes", resumeRoutes);
router.use("/recommendations", recommendRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    service: "AI Job Matcher API",
    version: "1.0.0",
    endpoints: {
      jobs: "/api/jobs",
      resumes: "/api/resumes",
      recommendations: "/api/recommendations",
    },
  });
});

export default router;
