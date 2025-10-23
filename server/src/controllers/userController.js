// server/src/controllers/UserController.js
import db from "../lib/prisma.js";
import { generateIndustryInsightsAI } from "../services/ai.service.js";

export async function updateUser(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const data = req.body;

    const result = await db.$transaction(async (tx) => {
      let industryInsight = await tx.industryInsight.findUnique({
        where: { industry: data.industry },
      });

      if (!industryInsight) {
        const insights = await generateIndustryInsightsAI(data.industry);
        industryInsight = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: data.industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
        },
      });

      return { updatedUser, industryInsight };
    });

    res.json(result.updatedUser);
  } catch (err) {
    next(err);
  }
}

export async function getOnboardingStatus(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
      select: { industry: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ isOnboarded: !!user.industry });
  } catch (err) {
    next(err);
  }
}
