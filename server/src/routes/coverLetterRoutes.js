// server/src/routes/coverLetter.routes.js
import express from "express";
import {
  createCoverLetter,
  deleteCoverLetter,
  getCoverLetter,
  listCoverLetters,
} from "../controllers/coverLetter.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, createCoverLetter);
router.get("/", requireAuth, listCoverLetters);
router.get("/:id", requireAuth, getCoverLetter);
router.delete("/:id", requireAuth, deleteCoverLetter);

export default router;
