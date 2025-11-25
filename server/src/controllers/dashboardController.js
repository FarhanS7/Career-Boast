// server/src/controllers/DashboardController.js
import db from "../lib/prisma.js";
import { generateIndustryInsightsAI } from "../services/ai.service.js";

export async function getIndustryInsights(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    let insight = await db.industryInsight.findUnique({
      where: {
        industry_subIndustry: {
          industry: user.industry,
          subIndustry: user.subIndustry
        }
      }
    });

    if (!insight) {
      const insights = await generateIndustryInsightsAI(user.industry);

      insight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          subIndustry: user.subIndustry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    res.json(insight);
  } catch (err) {
    next(err);
  }
}
