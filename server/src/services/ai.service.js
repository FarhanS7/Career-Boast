// HANDY-SERVER/src/services/ai.service.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Helper to generate content from the model and return cleaned text
 */
async function generateContent(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Generate a professional cover letter based on user profile and job details
 */
export async function generateCoverLetterAI(user, data) {
  const prompt = `
Write a professional cover letter for a ${data.jobTitle} position at ${
    data.companyName
  }.
Candidate Info:
- Industry: ${user.industry}
- Experience: ${user.experience} years
- Skills: ${user.skills?.join(", ")}
- Bio: ${user.bio}

Job Description:
${data.jobDescription}

Requirements:
1. Professional, enthusiastic tone
2. Highlight relevant skills/experience
3. Show understanding of company needs
4. Max 400 words
5. Proper business letter formatting in markdown
6. Include examples of achievements
7. Relate candidate's background to job requirements

Format as markdown.
`;
  return await generateContent(prompt);
}

/**
 * Generate industry insights in JSON format for a specific industry
 */
export async function generateIndustryInsightsAI(industry) {
  const prompt = `
Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format:
{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "High" | "Medium" | "Low",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "Positive" | "Neutral" | "Negative",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}
IMPORTANT: Return ONLY the JSON. No extra notes.
Include at least 5 common roles, skills, and trends.
`;
  const text = await generateContent(prompt);
  return JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
}

/**
 * Generate a technical quiz for a user based on their industry/skills
 */
export async function generateQuizAI(user) {
  const prompt = `
Generate 10 multiple-choice technical questions for a ${
    user.industry
  } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
Return ONLY JSON:
{
  "questions": [
    {
      "question": "string",
      "options": ["string","string","string","string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}
`;
  const text = await generateContent(prompt);
  const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return parsed.questions;
}

/**
 * Generate improvement tips for incorrectly answered quiz questions
 */
export async function generateImprovementTipAI(wrongAnswersText, industry) {
  const prompt = `
The user got the following ${industry} technical questions wrong:
${wrongAnswersText}

Provide a concise improvement tip (<2 sentences), focusing on knowledge gaps.
Do not explicitly mention the mistakes; focus on what to learn/practice.
`;
  return await generateContent(prompt);
}

/**
 * Improve a section of the resume
 */
export async function improveResumeAI(user, current, type) {
  const prompt = `
As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
Current content: "${current}"

Requirements:
1. Use action verbs
2. Include metrics/results where possible
3. Highlight relevant skills
4. Concise yet detailed
5. Focus on achievements
6. Use industry-specific keywords

Return as a single paragraph without extra text.
`;
  return await generateContent(prompt);
}
