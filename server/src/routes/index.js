import express from "express";
import coverLetterRoutes from "./coverLetterRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import interviewRoutes from "./interviewRoutes.js";
import resumeRoutes from "./resumeRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/cover-letter", coverLetterRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/interview", interviewRoutes);
router.use("/resume", resumeRoutes);
router.use("/user", userRoutes);

export default router;
