import prisma from "../lib/prisma.js";
import * as aiService from "../services/aiService.js";
import { generateEmbedding, prepareResumeText } from "../services/embeddingService.js";
import * as vectorService from "../services/vectorService.js";

/**
 * Generate AI-powered job recommendations for a resume
 */
export const generateRecommendations = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.auth?.userId;

    // Get resume
    const resume = await prisma.resumeProfile.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    // Optional: Check ownership
    if (userId && resume.userId && resume.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You don't have access to this resume",
      });
    }

    // Generate resume embedding
    const preparedText = prepareResumeText(resume.rawText);
    const resumeEmbedding = await generateEmbedding(preparedText);

    // Search for similar jobs in Qdrant
    console.log("Searching for similar jobs...");
    const similarJobs = await vectorService.searchSimilarJobs(resumeEmbedding, 30);

    if (similarJobs.length === 0) {
      return res.json({
        message: "No jobs found. Please sync jobs first.",
        recommendations: [],
      });
    }

    // Get full job details from database
    const jobIds = similarJobs.map((j) => j.jobId);
    const jobs = await prisma.jobPosting.findMany({
      where: {
        id: { in: jobIds },
      },
    });

    // Create a map for quick lookup
    const jobMap = {};
    jobs.forEach((job) => {
      jobMap[job.id] = job;
    });

    // Merge similarity scores with job data
    const matchedJobs = similarJobs.map((match) => ({
      ...jobMap[match.jobId],
      score: match.score,
    })).filter(job => job.id); // Filter out any missing jobs

    // Generate AI recommendations
    console.log("Generating AI recommendations...");
    const aiRecommendations = await aiService.generateRecommendations(
      resume,
      matchedJobs
    );

    // Save recommendations to database
    const savedRecommendations = [];
    for (const rec of aiRecommendations) {
      try {
        const saved = await prisma.jobRecommendation.upsert({
          where: {
            resumeId_jobId: {
              resumeId: resume.id,
              jobId: rec.jobId,
            },
          },
          create: {
            resumeId: resume.id,
            jobId: rec.jobId,
            matchScore: rec.matchScore,
            mainReason: rec.mainReason,
            skillsMatched: rec.skillsMatched || [],
            skillsMissing: rec.skillsMissing || [],
            aiMetadata: rec,
          },
          update: {
            matchScore: rec.matchScore,
            mainReason: rec.mainReason,
            skillsMatched: rec.skillsMatched || [],
            skillsMissing: rec.skillsMissing || [],
            aiMetadata: rec,
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: true,
                location: true,
                url: true,
                tags: true,
                jobType: true,
                salary: true,
                description: true,
              },
            },
          },
        });

        savedRecommendations.push(saved);
      } catch (error) {
        console.error(`Error saving recommendation for job ${rec.jobId}:`, error.message);
      }
    }

    res.json({
      message: "Recommendations generated successfully",
      resumeId: resume.id,
      totalRecommendations: savedRecommendations.length,
      recommendations: savedRecommendations.map((r) => ({
        id: r.id,
        job: r.job,
        matchScore: r.matchScore,
        mainReason: r.mainReason,
        skillsMatched: r.skillsMatched,
        skillsMissing: r.skillsMissing,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    next(error);
  }
};

/**
 * Get cached recommendations for a resume
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.auth?.userId;

    // Verify resume exists and user has access
    const resume = await prisma.resumeProfile.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    if (userId && resume.userId && resume.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    // Get cached recommendations
    const recommendations = await prisma.jobRecommendation.findMany({
      where: { resumeId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            url: true,
            tags: true,
            jobType: true,
            salary: true,
            description: true,
          },
        },
      },
      orderBy: {
        matchScore: "desc",
      },
    });

    res.json({
      resumeId,
      total: recommendations.length,
      recommendations: recommendations.map((r) => ({
        id: r.id,
        job: r.job,
        matchScore: r.matchScore,
        mainReason: r.mainReason,
        skillsMatched: r.skillsMatched,
        skillsMissing: r.skillsMissing,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  generateRecommendations,
  getRecommendations,
};
