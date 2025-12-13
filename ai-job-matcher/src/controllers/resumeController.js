import fs from "fs/promises";
import pdfParse from "pdf-parse";
import prisma from "../lib/prisma.js";
import * as embeddingService from "../services/embeddingService.js";
import * as vectorService from "../services/vectorService.js";

/**
 * Upload and process a resume
 */
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please upload a PDF or TXT file",
      });
    }

    // DEBUG: Check Environment Variables
    if (!process.env.GEMINI_API_KEY) {
        console.error("CRITICAL: GEMINI_API_KEY is missing");
        return res.status(500).json({ error: "Configuration Error", message: "Server missing GEMINI_API_KEY" });
    }
    if (!process.env.QDRANT_URL) {
        console.error("CRITICAL: QDRANT_URL is missing");
        return res.status(500).json({ error: "Configuration Error", message: "Server missing QDRANT_URL" });
    }
    if (!process.env.QDRANT_API_KEY) {
         console.warn("WARNING: QDRANT_API_KEY is missing (might be needed for cloud)");
    }

    console.log(`Processing upload: ${req.file.originalname} (${req.file.mimetype})`);

    const file = req.file;
    const userId = req.auth?.userId || null;

    // Extract text based on file type
    let rawText = "";
    
    if (file.mimetype === "application/pdf") {
      const dataBuffer = await fs.readFile(file.path);
      const pdfData = await pdfParse(dataBuffer);
      rawText = pdfData.text;
    } else if (file.mimetype === "text/plain") {
      rawText = await fs.readFile(file.path, "utf-8");
    } else {
      // Cleanup uploaded file
      await fs.unlink(file.path);
      return res.status(400).json({
        error: "Invalid file type",
        message: "Only PDF and TXT files are supported",
      });
    }

    // Cleanup uploaded file after extraction
    await fs.unlink(file.path);

    if (!rawText || rawText.trim().length < 100) {
      return res.status(400).json({
        error: "Invalid resume",
        message: "Resume text is too short or empty",
      });
    }

    // Save resume to database
    const resume = await prisma.resumeProfile.create({
      data: {
        userId,
        title: file.originalname,
        rawText,
        fileName: file.originalname,
        fileSize: file.size,
      },
    });

    // Generate embedding
    const preparedText = embeddingService.prepareResumeText(rawText);
    const embedding = await embeddingService.generateEmbedding(preparedText);

    // Store in Qdrant
    await vectorService.upsertResumeVector(resume.id, embedding, {
      title: resume.title,
      userId: resume.userId,
    });

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume: {
        id: resume.id,
        title: resume.title,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    try {
      await fs.writeFile("error.log", JSON.stringify({ 
        message: error.message, 
        stack: error.stack,
        data: error.data,
        status: error.status,
        statusText: error.statusText 
      }, null, 2));
    } catch (e) {
      console.error("Failed to write error log:", e);
    }
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message
    });
  }
};

/**
 * Get all resumes for the authenticated user
 */
export const getResumes = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;
    
    const resumes = await prisma.resumeProfile.findMany({
      where: userId ? { userId } : {},
      select: {
        id: true,
        title: true,
        fileName: true,
        fileSize: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            recommendations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      resumes,
      total: resumes.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single resume by ID
 */
export const getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;

    const resume = await prisma.resumeProfile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            recommendations: true,
          },
        },
      },
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    // Optional: Check if user owns this resume
    if (userId && resume.userId && resume.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You don't have access to this resume",
      });
    }

    res.json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete resume
 */
export const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;

    const resume = await prisma.resumeProfile.findUnique({
      where: { id },
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    // Check ownership
    if (userId && resume.userId && resume.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    // Delete from Qdrant
    await vectorService.deleteResumeVector(id);

    // Delete from database (cascade will delete recommendations)
    await prisma.resumeProfile.delete({
      where: { id },
    });

    res.json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
};
