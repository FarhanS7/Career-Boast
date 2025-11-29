// server/src/controllers/ResumeController.js
import db from "../lib/prisma.js";
import { improveResumeAI } from "../services/ai.service.js";

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
