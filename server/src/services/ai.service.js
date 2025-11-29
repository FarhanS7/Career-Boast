
import debugFactory from "debug";
import fetch from "node-fetch"; // ensure node-fetch is installed (npm i node-fetch@2) or use global fetch in Node 18+
const debug = debugFactory("handy:ai");

// Force debug output to console for now
debug.log = console.log.bind(console);
debug.enabled = true;

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"; // Updated to modern model

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
        const model = client.getGenerativeModel({ model: DEFAULT_MODEL });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
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

  // 2) Fallback: call the Generative Language REST endpoint directly
  // Using v1beta endpoint which supports gemini-1.5-flash
  const triedEndpoints = [];

  const restAttempts = [
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`,
      body: { contents: [{ parts: [{ text: prompt }] }] },
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
    console.error("❌ [AI Service] Failed to parse industry insights JSON:", err);
    console.error("❌ [AI Service] Raw text received:", text);
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
