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
  personalInfo: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
  summary: z.string().optional(),
  experience: z.array(z.object({
    company: z.string().optional(),
    position: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    description: z.string().optional(),
  })).optional(),
  education: z.array(z.object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    field: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    gpa: z.string().optional(),
  })).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
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
