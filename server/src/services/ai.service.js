
import debugFactory from "debug";
// import fetch from "node-fetch"; // Native fetch is available in Node 18+
const debug = debugFactory("handy:ai");

// Force debug output to console for now
debug.log = console.log.bind(console);
debug.enabled = true;

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest"; // Trying flash-latest alias

// Helper: attempt multiple client styles; never throw to caller, return string
async function generateContent(prompt, retries = 5) {
  if (!API_KEY) {
    debug("No GEMINI_API_KEY set in env.");
    return "[AI unavailable: GEMINI_API_KEY not configured]";
  }

  for (let attemptCount = 0; attemptCount <= retries; attemptCount++) {
    try {
      // 1) Try using @google/generative-ai (if installed and exposes models.generateContent)
      try {
        // lazy import so we don't crash if package not present
        const ga = await import("@google/generative-ai").catch(() => null);
        if (ga?.GoogleGenerativeAI) {
          debug(
            `Using @google/generative-ai package flow (attempt ${attemptCount + 1}).`
          );
          
          const client = new ga.GoogleGenerativeAI(API_KEY);
          const model = client.getGenerativeModel({ model: DEFAULT_MODEL });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          console.log(`[AI] Gemini API responded successfully`);
          return text;
        }
      } catch (err) {
        if (err.message?.includes("429") || err.status === 429) {
           throw err; // Throw to outer loop to trigger retry
        }
        console.error(`[AI] Error: ${err?.message || err}`);
        debug(
          "Error using @google/generative-ai client methods:",
          err?.message || err
        );
        // fall through to REST approach if it's not a rate limit
      }

      // 2) Fallback: call the Generative Language REST endpoint directly
      const triedEndpoints = [];
      const restAttempts = [
        {
          url: `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`,
          body: { contents: [{ parts: [{ text: prompt }] }] },
        },
      ];

      for (const attempt of restAttempts) {
        triedEndpoints.push(attempt.url);
        const res = await fetch(`${attempt.url}?key=${API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attempt.body),
        });
        const json = await res.json().catch(() => null);
        
        if (res.status === 429) {
           throw new Error("429 Too Many Requests");
        }

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
      }
    } catch (err) {
      if ((err.message?.includes("429") || err.status === 429) && attemptCount < retries) {
        const delay = Math.pow(2, attemptCount) * 1000 + (Math.random() * 1000);
        console.log(`[AI] Rate limited. Retrying in ${Math.round(delay)}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      // If we've run out of retries or it's not a rate limit error that we caught above
      if (attemptCount === retries) {
         debug("All AI attempts failed.", err?.message || err);
         return "[AI unavailable: failed to call provider or unsupported SDK version]";
      }
    }
  }
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
    console.error("[AI Service] Failed to parse industry insights JSON:", err);
    console.error("[AI Service] Raw text received:", text);
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

export async function calculateATSScoreAI(resumeData, jobDescription) {
  // Build resume text from structured data
  const resumeText = buildResumeText(resumeData);
  
  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the job description and provide a detailed compatibility assessment.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze the resume and return ONLY a JSON response in this exact format:
{
  "score": <number 0-100>,
  "keywordMatches": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2",
    ...
  ],
  "sectionScores": {
    "skills": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "overall": <number 0-100>
  },
  "summary": "Brief 2-3 sentence summary of the resume's ATS compatibility"
}

Scoring guidelines:
- 90-100: Excellent match, resume is highly optimized for this job
- 70-89: Good match, minor improvements needed
- 50-69: Moderate match, several important keywords missing
- 30-49: Weak match, significant gaps in qualifications
- 0-29: Poor match, resume needs major revision for this role

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations outside JSON.
`;

  const text = await generateContent(prompt);
  
  try {
    const cleaned = String(text)
      .replace(/```(?:json)?\\n?/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[AI Service] Failed to parse ATS score JSON:", err);
    console.error("[AI Service] Raw text received:", text);
    debug("Failed to parse ATS score JSON:", err?.message || err, "raw:", text);
    // Return fallback structure
    return {
      score: 0,
      keywordMatches: [],
      missingKeywords: [],
      suggestions: ["Unable to analyze resume. Please try again."],
      sectionScores: {
        skills: 0,
        experience: 0,
        education: 0,
        overall: 0,
      },
      summary: "Analysis failed. Please ensure your resume data is complete and try again.",
    };
  }
}

// Helper function to build readable text from structured resume data
function buildResumeText(resumeData) {
  if (typeof resumeData === 'string') return resumeData;
  if (!resumeData) return "";

  const parts = [];
  
  // Personal Info
  if (resumeData.personalInfo) {
    const pi = resumeData.personalInfo;
    parts.push(`NAME: ${pi.name || "N/A"}`);
    if (pi.email) parts.push(`EMAIL: ${pi.email}`);
    if (pi.phone) parts.push(`PHONE: ${pi.phone}`);
    if (pi.location) parts.push(`LOCATION: ${pi.location}`);
  }
  
  // Summary
  if (resumeData.summary) {
    parts.push(`\nPROFESSIONAL SUMMARY:\n${resumeData.summary}`);
  }
  
  // Skills
  if (resumeData.skills?.length) {
    parts.push(`\nSKILLS:\n${resumeData.skills.join(", ")}`);
  }
  
  // Experience
  if (resumeData.experience?.length) {
    parts.push("\nWORK EXPERIENCE:");
    resumeData.experience.forEach((exp, i) => {
      parts.push(`${i + 1}. ${exp.position || exp.title || "Position"} at ${exp.company || exp.organization || "Company"}`);
      if (exp.startDate) parts.push(`   Duration: ${exp.startDate} - ${exp.endDate || (exp.current ? "Present" : "N/A")}`);
      if (exp.description) parts.push(`   ${exp.description}`);
    });
  }
  
  // Education
  if (resumeData.education?.length) {
    parts.push("\nEDUCATION:");
    resumeData.education.forEach((edu, i) => {
      parts.push(`${i + 1}. ${edu.degree || "Degree"} in ${edu.field || "Field"} from ${edu.institution || "Institution"}`);
      if (edu.startDate) parts.push(`   Duration: ${edu.startDate} - ${edu.endDate || "N/A"}`);
      if (edu.gpa) parts.push(`   GPA: ${edu.gpa}`);
    });
  }
  
  // Certifications
  if (resumeData.certifications?.length) {
    parts.push(`\nCERTIFICATIONS:\n${resumeData.certifications.join(", ")}`);
  }
  
  // Languages
  if (resumeData.languages?.length) {
    parts.push(`\nLANGUAGES:\n${resumeData.languages.join(", ")}`);
  }
  
  return parts.join("\n");
}
