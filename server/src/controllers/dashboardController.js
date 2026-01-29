// server/src/controllers/DashboardController.js
import db from "../lib/prisma.js";
import { generateIndustryInsightsAI } from "../services/ai.service.js";

// Helper function to run generation in background
async function generateAndSaveInsights(userId, industry, subIndustry) {
  try {
    console.log(`🚀 [Background Job] Starting AI generation for ${industry}/${subIndustry}...`);
    const insights = await generateIndustryInsightsAI(industry);
    
    console.log(`💾 [Background Job] AI complete. Saving to database...`);
    
    await db.industryInsight.upsert({
      where: {
        industry_subIndustry: {
          industry: industry,
          subIndustry: subIndustry
        }
      },
      update: {
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        industry: industry,
        subIndustry: subIndustry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✅ [Background Job] Saved successfully for ${industry}`);
  } catch (error) {
    console.error(`❌ [Background Job] Failed:`, error);
  }
}

export async function getIndustryInsights(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.industry || !user.subIndustry) {
      return res.status(400).json({ 
        error: "Please complete onboarding to set your industry" 
      });
    }

    // Check Cache
    const insight = await db.industryInsight.findUnique({
      where: {
        industry_subIndustry: {
          industry: user.industry,
          subIndustry: user.subIndustry
        }
      }
    });

    // Valid Cache Hit
    if (insight && insight.salaryRanges && insight.salaryRanges.length > 0 && req.query.refresh !== 'true') {
      console.log("✅ [Industry Insights] Cache Hit");
      // Add cache headers for performance
      res.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600');
      return res.json(insight);
    }

    // Cache Miss or Empty -> Trigger Background Gen + Return "Generating"
    console.log("♻️ [Industry Insights] Cache Miss. Triggering Background AI...");
    
    // Fire and forget (don't await)
    generateAndSaveInsights(user.id, user.industry, user.subIndustry);

    // Return immediate response
    return res.status(202).json({ 
      status: "generating", 
      message: "AI is analyzing current market trends...",
      nextPoll: 3000 // Tell frontend to come back in 3s
    });

  } catch (err) {
    console.error("❌ [Industry Insights] Error:", err);
    next(err);
  }
}

export async function getDashboardStats(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Run all counts in parallel for performance
    const [resumeCount, coverLetterCount, interviewCount] = await Promise.all([
      db.resume.count({ where: { userId: user.id } }),
      db.coverLetter.count({ where: { userId: user.id } }),
      db.assessment.count({ where: { userId: user.id } }),
    ]);

    // Add cache headers for performance (short cache since data can change)
    res.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
    res.json({
      resumes: resumeCount,
      coverLetters: coverLetterCount,
      interviews: interviewCount,
      // We also include industry/subIndustry so frontend knows if onboarding is needed
      industry: user.industry,
      subIndustry: user.subIndustry
    });
  } catch (err) {
    console.error("❌ [Dashboard Stats] Error:", err);
    next(err);
  }
}
