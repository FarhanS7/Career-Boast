import { inngest } from "../lib/inngest.js";
import db from "../lib/prisma.js";
import {
    generateCoverLetterAI,
    generateIndustryInsightsAI
} from "../services/ai.service.js";

export const generateIndustryInsights = inngest.createFunction(
  { id: "generate-industry-insights", name: "Generate Industry Insights" },
  { event: "insights.generate" },
  async ({ event, step }) => {
    const { industry } = event.data;

    const insights = await step.run("Generate AI Insights", async () => {
      return await generateIndustryInsightsAI(industry);
    });

    await step.run("Save to DB", async () => {
      await db.industryInsight.create({
        data: {
          industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });

    return { success: true, industry };
  }
);

export const generateCoverLetter = inngest.createFunction(
  { id: "generate-cover-letter", name: "Generate Cover Letter" },
  { event: "cover_letter.generate" },
  async ({ event, step }) => {
    const { userId, data } = event.data;

    const user = await step.run("Fetch User", async () => {
      return await db.user.findUnique({ where: { id: userId } });
    });

    if (!user) throw new Error("User not found");

    const content = await step.run("Generate AI Content", async () => {
      return await generateCoverLetterAI(user, data);
    });

    await step.run("Save Cover Letter", async () => {
      await db.coverLetter.create({
        data: {
          content,
          jobDescription: data.jobDescription,
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          status: "completed",
          userId: user.id,
        },
      });
    });

    return { success: true };
  }
);

export const generateQuiz = inngest.createFunction(
  { id: "generate-quiz", name: "Generate Quiz" },
  { event: "quiz.generate" },
  async ({ event, step }) => {
    const { userId, industry, skills } = event.data;

    const questions = await step.run("Generate Quiz Questions", async () => {
      return await generateQuizAI({ industry, skills });
    });

    // Note: We don't save the quiz questions to DB here as the current model 
    // expects the frontend to receive them and then submit answers.
    // In a background job flow, we might want to save them to a 'PendingAssessment' 
    // or notify the user via websocket/push.
    // For now, we just return them.
    
    return { questions };
  }
);

export const improveResume = inngest.createFunction(
  { id: "improve-resume", name: "Improve Resume" },
  { event: "resume.improve" },
  async ({ event, step }) => {
    const { userId, current, type } = event.data;

    const user = await step.run("Fetch User", async () => {
      return await db.user.findUnique({ where: { id: userId } });
    });

    if (!user) throw new Error("User not found");

    const improvedContent = await step.run("Improve Content", async () => {
      return await improveResumeAI(user, current, type);
    });

    return { improvedContent };
  }
);
