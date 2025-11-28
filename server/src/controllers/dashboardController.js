// server/src/controllers/DashboardController.js
import db from "../lib/prisma.js";
import { generateIndustryInsightsAI } from "../services/ai.service.js";

export async function getIndustryInsights(req, res, next) {
  try {
    console.log("🔍 [Industry Insights] Request received for userId:", req.userId);
    
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });

    if (!user) {
      console.log("❌ [Industry Insights] User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ [Industry Insights] User found:", {
      id: user.id,
      industry: user.industry,
      subIndustry: user.subIndustry
    });

    if (!user.industry || !user.subIndustry) {
      console.log("⚠️ [Industry Insights] User missing industry/subIndustry");
      return res.status(400).json({ 
        error: "Please complete onboarding to set your industry" 
      });
    }

    console.log("🔎 [Industry Insights] Checking database for existing insights...");

    let insight = await db.industryInsight.findUnique({
      where: {
        industry_subIndustry: {
          industry: user.industry,
          subIndustry: user.subIndustry
        }
      }
    });

    if (insight) {
      console.log("✅ [Industry Insights] Found existing insights:", insight);
    }

    // Force refresh if data looks empty or if requested
    if (!insight || insight.salaryRanges.length === 0 || req.query.refresh === 'true') {
      console.log("♻️ [Industry Insights] Data missing or refresh requested. Generating...");

      console.log("🔑 [Industry Insights] GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
      
      const insights = await generateIndustryInsightsAI(user.industry);
      console.log("✅ [Industry Insights] AI generation complete");

      console.log("💾 [Industry Insights] Saving/Updating database...");
      
      // Use upsert to handle both new creation and updates
      insight = await db.industryInsight.upsert({
        where: {
          industry_subIndustry: {
            industry: user.industry,
            subIndustry: user.subIndustry
          }
        },
        update: {
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        create: {
          industry: user.industry,
          subIndustry: user.subIndustry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      console.log("✅ [Industry Insights] Saved successfully");
    }

    res.json(insight);
  } catch (err) {
    console.error("❌ [Industry Insights] Error:", err);
    next(err);
  }
}
