// server/src/controllers/CoverLetterController.js
import db from "../lib/prisma.js";
import { generateCoverLetterAI } from "../services/ai.service.js";

export async function createCoverLetter(req, res, next) {
  try {
    const userId = req.userId;
    const data = req.body;

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const content = await generateCoverLetterAI(user, data);

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    res.json(coverLetter);
  } catch (err) {
    next(err);
  }
}

export async function listCoverLetters(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const letters = await db.coverLetter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(letters);
  } catch (err) {
    next(err);
  }
}

export async function getCoverLetter(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const letter = await db.coverLetter.findFirst({
      where: { id: req.params.id, userId: user.id },
    });

    if (!letter) return res.status(404).json({ error: "Not found" });
    res.json(letter);
  } catch (err) {
    next(err);
  }
}

export async function deleteCoverLetter(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const deleted = await db.coverLetter.deleteMany({
      where: { id: req.params.id, userId: user.id },
    });

    res.json({ deletedCount: deleted.count || 0 });
  } catch (err) {
    next(err);
  }
}

export async function updateCoverLetter(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const letter = await db.coverLetter.findUnique({
      where: { id: req.params.id },
    });

    if (!letter) return res.status(404).json({ error: "Not found" });
    if (letter.userId !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updated = await db.coverLetter.update({
      where: { id: req.params.id },
      data: {
        content: req.body.content,
        jobDescription: req.body.jobDescription,
        companyName: req.body.companyName,
        jobTitle: req.body.jobTitle,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
