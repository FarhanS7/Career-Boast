import express from "express";
import {
    createCoverLetter,
    deleteCoverLetter,
    getCoverLetter,
    listCoverLetters,
    updateCoverLetter,
} from "../controllers/coverLetterController.js";
import { coverLetterSchema } from "../lib/schema.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post("/", requireAuth, validateSchema(coverLetterSchema), createCoverLetter);
router.get("/", requireAuth, listCoverLetters);
router.get("/:id", requireAuth, getCoverLetter);
router.put("/:id", requireAuth, updateCoverLetter);
router.delete("/:id", requireAuth, deleteCoverLetter);

export default router;
