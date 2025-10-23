import express from "express";
import coverLetterRoutes from "./coverLetter.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import interviewRoutes from "./interview.routes.js";
import resumeRoutes from "./resume.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();

router.use("/cover-letter", coverLetterRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/interview", interviewRoutes);
router.use("/resume", resumeRoutes);
router.use("/user", userRoutes);

export default router;
