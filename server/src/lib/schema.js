// HANDY-SERVER/src/lib/schema.js
import { z } from "zod";

export const onboardingSchema = z.object({
  industry: z.string({ required_error: "Please select an industry" }),
  subIndustry: z.string({ required_error: "Please select a specialization" }),
  bio: z.string().max(500).optional(),
  experience: z.number().min(0, "Experience must be at least 0 years").max(50, "Experience cannot exceed 50 years"),
  skills: z.array(z.string()),
});

export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

export const entrySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    current: z.boolean().default(false),
  })
  .refine((data) => data.current || data.endDate, {
    message: "End date is required unless this is your current position",
    path: ["endDate"],
  });

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Professional summary is required"),
  skills: z.string().min(1, "Skills are required"),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
});

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

export const improveResumeSchema = z.object({
  current: z.string().min(1, "Current content is required"),
  type: z.enum(["experience", "education", "projects", "summary"]),
});

export const quizResultSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      correctAnswer: z.string(),
      userAnswer: z.string().optional(),
      explanation: z.string().optional(),
    })
  ),
  answers: z.array(z.string()),
  score: z.number().min(0).max(100),
});
