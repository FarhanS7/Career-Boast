// server/src/controllers/ResumeController.js
import db from "../lib/prisma.js";
import { calculateATSScoreAI, improveResumeAI } from "../services/ai.service.js";

export async function saveResume(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { 
      personalInfo, 
      summary, 
      experience, 
      education, 
      skills, 
      certifications, 
      languages 
    } = req.body;

    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { 
        personalInfo,
        summary,
        experience: experience || [],
        education: education || [],
        skills: skills || [],
        certifications: certifications || [],
        languages: languages || [],
      },
      create: { 
        userId: user.id,
        personalInfo,
        summary,
        experience: experience || [],
        education: education || [],
        skills: skills || [],
        certifications: certifications || [],
        languages: languages || [],
      },
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

export async function getResumeById(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resume = await db.resume.findUnique({
      where: { id: req.params.id },
    });

    if (!resume) return res.status(404).json({ error: "Resume not found" });
    if (resume.userId !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(resume);
  } catch (err) {
    next(err);
  }
}

export async function updateResume(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resume = await db.resume.findUnique({
      where: { id: req.params.id },
    });

    if (!resume) return res.status(404).json({ error: "Resume not found" });
    if (resume.userId !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { 
      personalInfo, 
      summary, 
      experience, 
      education, 
      skills, 
      certifications, 
      languages 
    } = req.body;

    const updated = await db.resume.update({
      where: { id: req.params.id },
      data: {
        personalInfo,
        summary,
        experience: experience || [],
        education: education || [],
        skills: skills || [],
        certifications: certifications || [],
        languages: languages || [],
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resume = await db.resume.findUnique({
      where: { id: req.params.id },
    });

    if (!resume) return res.status(404).json({ error: "Resume not found" });
    if (resume.userId !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.resume.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function shareResume(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resume = await db.resume.findUnique({
      where: { id: req.params.id },
    });

    if (!resume) return res.status(404).json({ error: "Resume not found" });
    if (resume.userId !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Generate share token if not exists
    const shareToken = resume.shareToken || Math.random().toString(36).substring(2, 15);
    
    const updated = await db.resume.update({
      where: { id: req.params.id },
      data: { shareToken },
    });

    res.json({ shareToken: updated.shareToken });
  } catch (err) {
    next(err);
  }
}

export async function checkATSScore(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resume = await db.resume.findUnique({ where: { userId: user.id } });
    if (!resume) {
      return res.status(404).json({ 
        error: "Resume not found",
        message: "Please create a resume first before checking ATS score" 
      });
    }

    const { jobDescription } = req.body;

    // Prepare resume data for ATS analysis
    const resumeData = {
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      certifications: resume.certifications,
      languages: resume.languages,
    };

    // Get ATS score from AI
    const atsResult = await calculateATSScoreAI(resumeData, jobDescription);

    // Optionally update the resume's atsScore field
    if (atsResult.score && typeof atsResult.score === 'number') {
      await db.resume.update({
        where: { id: resume.id },
        data: { atsScore: atsResult.score },
      });
    }

    res.json({
      success: true,
      ...atsResult,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkATSScoreFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.length < 50) {
      return res.status(400).json({ 
        error: "Invalid job description", 
        message: "Job description must be at least 50 characters" 
      });
    }

    let resumeText = "";

    // Parse file based on type
    if (req.file.mimetype === "application/pdf") {
      // Use createRequire for reliable CJS import of pdf-parse v1.1.1
      const { createRequire } = await import("module");
      const require = createRequire(import.meta.url);
      const pdfParse = require("pdf-parse");
      
      const dataBuffer = req.file.buffer;
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
    } else if (req.file.mimetype === "text/plain") {
      resumeText = req.file.buffer.toString("utf-8");
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload PDF or TXT." });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: "Could not extract text from resume or text is too short" });
    }

    // Get ATS score from AI
    const atsResult = await calculateATSScoreAI(resumeText, jobDescription);

    res.json({
      success: true,
      ...atsResult,
    });
  } catch (err) {
    next(err);
  }
}


