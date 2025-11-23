// // HANDY-SERVER/src/services/ai.service.js
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// // const model = genAI.getGenerativeModel({ model: "gemini-1.5" });
// const client = new GoogleGenerativeAI({
//   apiKey: process.env.GEMINI_API_KEY, // your server-side key
// });
// /**
//  * Helper to generate content from the model and return cleaned text
//  */
// async function generateContent(prompt) {
//   // Use the new `client.chat.completions.create` or `client.text.completions.create`
//   const response = await client.chat.completions.create({
//     model: "gemini-1.5",
//     messages: [
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//     temperature: 0.7,
//     max_output_tokens: 500,
//   });

//   // Returns the text of the first message
//   return response?.choices?.[0]?.message?.content || "";
// }

// /**
//  * Generate a professional cover letter based on user profile and job details
//  */
// export async function generateCoverLetterAI(user, data) {
//   const prompt = `
// Write a professional cover letter for a ${data.jobTitle} position at ${
//     data.companyName
//   }.
// Candidate Info:
// - Industry: ${user.industry}
// - Experience: ${user.experience} years
// - Skills: ${user.skills?.join(", ")}
// - Bio: ${user.bio}

// Job Description:
// ${data.jobDescription}

// Requirements:
// 1. Professional, enthusiastic tone
// 2. Highlight relevant skills/experience
// 3. Show understanding of company needs
// 4. Max 400 words
// 5. Proper business letter formatting in markdown
// 6. Include examples of achievements
// 7. Relate candidate's background to job requirements

// Format as markdown.
// `;
//   return await generateContent(prompt);
// }

// /**
//  * Generate industry insights in JSON format for a specific industry
//  */
// export async function generateIndustryInsightsAI(industry) {
//   const prompt = `
// Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format:
// {
//   "salaryRanges": [
//     { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
//   ],
//   "growthRate": number,
//   "demandLevel": "High" | "Medium" | "Low",
//   "topSkills": ["skill1", "skill2"],
//   "marketOutlook": "Positive" | "Neutral" | "Negative",
//   "keyTrends": ["trend1", "trend2"],
//   "recommendedSkills": ["skill1", "skill2"]
// }
// IMPORTANT: Return ONLY the JSON. No extra notes.
// Include at least 5 common roles, skills, and trends.
// `;
//   const text = await generateContent(prompt);
//   return JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
// }

// /**
//  * Generate a technical quiz for a user based on their industry/skills
//  */
// export async function generateQuizAI(user) {
//   const prompt = `
// Generate 10 multiple-choice technical questions for a ${
//     user.industry
//   } professional${
//     user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
//   }.
// Return ONLY JSON:
// {
//   "questions": [
//     {
//       "question": "string",
//       "options": ["string","string","string","string"],
//       "correctAnswer": "string",
//       "explanation": "string"
//     }
//   ]
// }
// `;
//   const text = await generateContent(prompt);
//   const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
//   const parsed = JSON.parse(cleaned);
//   return parsed.questions;
// }

// /**
//  * Generate improvement tips for incorrectly answered quiz questions
//  */
// export async function generateImprovementTipAI(wrongAnswersText, industry) {
//   const prompt = `
// The user got the following ${industry} technical questions wrong:
// ${wrongAnswersText}

// Provide a concise improvement tip (<2 sentences), focusing on knowledge gaps.
// Do not explicitly mention the mistakes; focus on what to learn/practice.
// `;
//   return await generateContent(prompt);
// }

// /**
//  * Improve a section of the resume
//  */
// export async function improveResumeAI(user, current, type) {
//   const prompt = `
// As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
// Current content: "${current}"

// Requirements:
// 1. Use action verbs
// 2. Include metrics/results where possible
// 3. Highlight relevant skills
// 4. Concise yet detailed
// 5. Focus on achievements
// 6. Use industry-specific keywords

// Return as a single paragraph without extra text.
// `;
//   return await generateContent(prompt);
// }
// HANDY-SERVER/src/services/ai.service.js
import debugFactory from "debug";
import fetch from "node-fetch"; // ensure node-fetch is installed (npm i node-fetch@2) or use global fetch in Node 18+
const debug = debugFactory("handy:ai");

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "text-bison-001"; // safer default

// Helper: attempt multiple client styles; never throw to caller, return string
async function generateContent(prompt) {
  if (!API_KEY) {
    debug("No GEMINI_API_KEY set in env.");
    return "[AI unavailable: GEMINI_API_KEY not configured]";
  }

  // 1) Try using @google/generative-ai (if installed and exposes models.generateContent)
  try {
    // lazy import so we don't crash if package not present
    const ga = await import("@google/generative-ai").catch(() => null);
    if (ga?.GoogleGenerativeAI) {
      debug(
        "Using @google/generative-ai package flow (models.generateContent attempt)."
      );
      try {
        const client = new ga.GoogleGenerativeAI(API_KEY);
        // some versions expose client.models.generateContent or client.models.generateText
        if (client.models?.generateContent) {
          const resp = await client.models.generateContent({
            model: DEFAULT_MODEL,
            contents: [{ text: prompt }],
          });
          // many libs return .text or .response.text()
          if (resp?.text) return String(resp.text).trim();
          if (resp?.response?.text) return String(resp.response.text).trim();
          if (typeof resp === "string") return resp.trim();
          if (resp?.candidates?.[0]?.content) return resp.candidates[0].content;
        }
        if (client.models?.generateText) {
          const resp = await client.models.generateText({
            model: DEFAULT_MODEL,
            prompt,
          });
          if (resp?.candidates?.[0]?.content) return resp.candidates[0].content;
          if (resp?.text) return resp.text;
        }
      } catch (err) {
        debug(
          "Error using @google/generative-ai client methods:",
          err?.message || err
        );
        // fall through to next approach
      }
    }
  } catch (err) {
    debug(
      "Import attempt for @google/generative-ai failed:",
      err?.message || err
    );
  }

  // 2) Try other exported shapes (older or newer variants)
  try {
    const genai = await import("@google/generative-ai").catch(() => null);
    if (genai) {
      // some versions provided GoogleGenerativeAI as default or named differently
      const candidateClient = genai.GoogleGenerativeAI || genai.default || null;
      if (candidateClient) {
        debug("Using alternate @google/generative-ai client flow.");
        try {
          const client = new candidateClient(API_KEY);
          // try chat / completions forms if present
          if (client.chat?.completions?.create) {
            const r = await client.chat.completions.create({
              model: DEFAULT_MODEL,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_output_tokens: 500,
            });
            const content = r?.choices?.[0]?.message?.content;
            if (content) return content;
          }
          if (client.generateText) {
            const r = await client.generateText({
              model: DEFAULT_MODEL,
              prompt,
            });
            if (r?.candidates?.[0]?.content) return r.candidates[0].content;
            if (r?.text) return r.text;
          }
        } catch (err) {
          debug("Alternate client flow failed:", err?.message || err);
        }
      }
    }
  } catch (err) {
    debug("Alternate import error:", err?.message || err);
  }

  // 3) Fallback: call the Generative Language REST endpoint directly
  // NOTE: REST path varies by API version; many setups accept v1beta2 or v1
  // We'll try v1 endpoint with generateText body format, then v1beta2
  const triedEndpoints = [];

  const restAttempts = [
    {
      url: `https://generativelanguage.googleapis.com/v1/models/${DEFAULT_MODEL}:generateText`,
      body: { prompt: { text: prompt } },
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta2/models/${DEFAULT_MODEL}:generateText`,
      body: { prompt: { text: prompt } },
    },
    {
      url: `https://generativelanguage.googleapis.com/v1/models/${DEFAULT_MODEL}:generateMessage`,
      body: { input: prompt },
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta2/models/${DEFAULT_MODEL}:generateContent`,
      body: { contents: [{ text: prompt }] },
    },
  ];

  for (const attempt of restAttempts) {
    try {
      triedEndpoints.push(attempt.url);
      const res = await fetch(attempt.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(attempt.body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        debug(`REST ${attempt.url} returned ${res.status}`, json);
        continue;
      }
      // Attempt to parse common response shapes:
      if (json?.candidates?.[0]?.content) return json.candidates[0].content;
      if (json?.output?.[0]?.content?.[0]?.text)
        return json.output[0].content[0].text;
      if (json?.text) return json.text;
      if (json?.response?.text) return json.response.text;
      if (json?.result?.[0]) return String(json.result[0]).trim();
      // else return entire json as string
      return JSON.stringify(json);
    } catch (err) {
      debug("REST attempt error for", attempt.url, err?.message || err);
      // try next
    }
  }

  debug("All AI attempts failed. Tried endpoints:", triedEndpoints);
  return "[AI unavailable: failed to call provider or unsupported SDK version]";
}

/* Convenience wrappers used by your controllers below.
   They use generateContent() and parse outputs as needed.
*/

export async function generateCoverLetterAI(user, data) {
  const prompt = `
Write a professional cover letter for a ${data.jobTitle} position at ${
    data.companyName
  }.
Candidate Info:
- Industry: ${user?.industry || "N/A"}
- Experience: ${user?.experience || "N/A"} years
- Skills: ${
    Array.isArray(user?.skills) ? user.skills.join(", ") : user?.skills || ""
  }
- Bio: ${user?.bio || ""}

Job Description:
${data.jobDescription || ""}

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
  // best-effort parse; guard against invalid JSON
  try {
    const cleaned = String(text)
      .replace(/```(?:json)?\n?/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    debug(
      "Failed to parse industry insights JSON:",
      err?.message || err,
      "raw:",
      text
    );
    // fallback: return minimal shape
    return {
      salaryRanges: [],
      growthRate: 0,
      demandLevel: "Unknown",
      topSkills: [],
      marketOutlook: "Neutral",
      keyTrends: [],
      recommendedSkills: [],
    };
  }
}

export async function generateQuizAI(user) {
  const prompt = `
Generate 10 multiple-choice technical questions for a ${
    user.industry || "general"
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
  try {
    const cleaned = String(text)
      .replace(/```(?:json)?\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    return parsed.questions || [];
  } catch (err) {
    debug("Failed to parse quiz JSON:", err?.message || err, "raw:", text);
    return [];
  }
}

export async function generateImprovementTipAI(wrongAnswersText, industry) {
  const prompt = `
The user got the following ${industry} technical questions wrong:
${wrongAnswersText}

Provide a concise improvement tip (<2 sentences), focusing on knowledge gaps.
Do not explicitly mention the mistakes; focus on what to learn/practice.
`;
  return await generateContent(prompt);
}

export async function improveResumeAI(user, current, type) {
  const prompt = `
As an expert resume writer, improve the following ${type} description for a ${
    user.industry || "professional"
  }.
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
