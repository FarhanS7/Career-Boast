// server/src/controllers/ResumeController.js
import db from "../lib/prisma.js";
import { improveResumeAI } from "../services/ai.service.js";

export async function saveResume(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { content } = req.body;

    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content },
      create: { userId: user.id, content },
    });

    res.json(resume);
  } catch (err) {
    next(err);
  }
}

export async function getResume(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resume = await db.resume.findUnique({ where: { userId: user.id } });
    res.json(resume);
  } catch (err) {
    next(err);
  }
}

export async function improveResume(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { current, type } = req.body;
    const improved = await improveResumeAI(user, current, type);

    res.json({ improved });
  } catch (err) {
    next(err);
  }
}
