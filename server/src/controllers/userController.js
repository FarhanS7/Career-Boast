// server/src/controllers/UserController.js
import { checkUser } from "../lib/checkUser.js";
import db from "../lib/prisma.js";
import { generateIndustryInsightsAI } from "../services/ai.service.js";

export const getMe = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user info" });
  }
};

export async function checkOrCreateUser(req, res, next) {
  try {
    const { clerkUserId, clerkData } = req.body;
    if (!clerkUserId)
      return res.status(400).json({ error: "clerkUserId is required" });

    const user = await checkUser(clerkUserId, clerkData);
    if (!user)
      return res.status(404).json({ error: "User not found or invalid data" });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const data = req.body;

    // Check if industry insight exists BEFORE the transaction
    let existingInsight = await db.industryInsight.findUnique({
      where: {
        industry_subIndustry: {
          industry: data.industry,
          subIndustry: data.subIndustry
        }
      }
    });

    // Generate AI insights OUTSIDE the transaction (this is slow)
    let insights = null;
    if (!existingInsight) {
      insights = await generateIndustryInsightsAI(data.industry);
    }

    // Now run the fast database operations in a transaction
    const result = await db.$transaction(async (tx) => {
      let industryInsight = existingInsight;

      if (!industryInsight && insights) {
        industryInsight = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            subIndustry: data.subIndustry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: data.industry,
          subIndustry: data.subIndustry,
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
      select: { industry: true, subIndustry: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ completed: !!user.industry && !!user.subIndustry });
  } catch (err) {
    next(err);
  }
}
