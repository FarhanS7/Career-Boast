// server/src/controllers/DashboardController.js
import db from "../lib/prisma.js";
import { generateIndustryInsightsAI } from "../services/ai.service.js";

export async function getIndustryInsights(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
      include: { industryInsight: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.industryInsight) {
      const insights = await generateIndustryInsightsAI(user.industry);
      const industryInsight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return res.json(industryInsight);
    }

    res.json(user.industryInsight);
  } catch (err) {
    next(err);
  }
}
