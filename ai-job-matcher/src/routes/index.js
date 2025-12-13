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
      diagnose: "/api/diagnose"
    },
  });
});

import { getEmbeddingModel } from "../lib/gemini.js";
import prisma from "../lib/prisma.js";
import { getQdrantClient } from "../lib/qdrant.js";

router.get("/diagnose", async (req, res) => {
  const report = {
    timestamp: new Date().toISOString(),
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "Set (Ends with " + process.env.GEMINI_API_KEY.slice(-4) + ")" : "MISSING",
      QDRANT_URL: process.env.QDRANT_URL || "MISSING",
      QDRANT_API_KEY: process.env.QDRANT_API_KEY ? "Set (Length: " + process.env.QDRANT_API_KEY.length + ")" : "MISSING",
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "MISSING",
    },
    tests: {}
  };

  // Test 1: Qdrant
  try {
    const qdrant = getQdrantClient();
    const collections = await qdrant.getCollections();
    report.tests.qdrant = { status: "OK", collections: collections.collections.map(c => c.name) };
  } catch (err) {
    report.tests.qdrant = { status: "FAILED", error: err.message };
  }

  // Test 2: Gemini
  try {
    const model = getEmbeddingModel();
    const result = await model.embedContent("test");
    report.tests.gemini = { status: "OK", vectorLength: result.embedding.values.length };
  } catch (err) {
    report.tests.gemini = { status: "FAILED", error: err.message };
  }

  // Test 3: Database
  try {
    const count = await prisma.resumeProfile.count();
    report.tests.database = { status: "OK", resumeCount: count };
  } catch (err) {
    report.tests.database = { status: "FAILED", error: err.message };
  }

  res.json(report);
});

export default router;
