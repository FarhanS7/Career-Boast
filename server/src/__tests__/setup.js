import { jest } from "@jest/globals";

// Mock Prisma
jest.unstable_mockModule("../lib/prisma.js", () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    industryInsight: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    resume: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    coverLetter: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
    assessment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      industryInsight: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
    })),
  },
}));

// Mock Clerk Auth
jest.unstable_mockModule("@clerk/express", () => ({
  clerkMiddleware: () => (req, res, next) => next(),
  getAuth: () => ({ userId: "test_user_id" }),
}));

// Mock Google Generative AI
jest.unstable_mockModule("../services/ai.service.js", () => ({
  generateIndustryInsightsAI: jest.fn(() => ({
    salaryRanges: [],
    growthRate: 0,
    demandLevel: "High",
    topSkills: [],
    marketOutlook: "Positive",
    keyTrends: [],
    recommendedSkills: [],
  })),
  generateCoverLetterAI: jest.fn(() => "Generated Cover Letter"),
  generateQuizAI: jest.fn(() => []),
  generateImprovementTipAI: jest.fn(() => "Tip"),
  improveResumeAI: jest.fn(() => "Improved Content"),
}));

// Mock Inngest
jest.unstable_mockModule("../lib/inngest.js", () => ({
  inngest: {
    createFunction: jest.fn(() => ({
      id: "test-function",
      getConfig: () => ({ id: "test-function", name: "Test Function" }),
    })),
  },
}));

jest.unstable_mockModule("inngest/express", () => ({
  serve: jest.fn(() => (req, res) => res.status(200).json({ message: "Inngest handler mocked" })),
}));
