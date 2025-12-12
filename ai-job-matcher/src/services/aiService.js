import { getGenerativeModel } from "../lib/gemini.js";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithRetry = async (model, prompt, maxRetries = 5) => {
  let retries = 0;
  while (retries <= maxRetries) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      // Check for 429 or 503 (service unavailable) which are retryable
      const isRetryable = error.message.includes("429") || 
                          error.status === 429 || 
                          error.message.includes("Too Many Requests") ||
                          error.status === 503;
      
      if (isRetryable) {
        retries++;
        if (retries > maxRetries) {
          console.error(`Failed after ${maxRetries} retries due to quota/service:`, error.message);
          throw error;
        }
        
        // Parse retryDelay from error details if available (e.g., "retryDelay": "33s")
        let delay = 0;
        if (error.errorDetails) {
          const retryInfo = error.errorDetails.find(d => d.retryDelay);
          if (retryInfo) {
            const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
            if (!isNaN(seconds)) delay = (seconds + 1) * 1000; // Add 1s buffer
          }
        }
        
        // If no specific delay found, use aggressive exponential backoff: 5s, 10s, 20s, 40s, 80s
        if (!delay) {
            delay = 5000 * Math.pow(2, retries - 1);
        }
        
        console.log(`Rate limited. Waiting ${delay/1000}s before retry ${retries}/${maxRetries}...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to generate content after multiple retries.");
};

export const generateRecommendations = async (resume, matchedJobs) => {
  const model = getGenerativeModel();
  
  // DRASTICALLY REDUCE CONTEXT TO FIT FREE TIER
  // 1. Truncate resume to 2000 chars
  // 2. Reduce similar jobs to top 5
  // 3. Remove job description, only send title/company/tags
  
  const jobsToAnalyze = matchedJobs.slice(0, 5);
  
  const prompt = `You are an expert career advisor.
  
Analyze the resume and these ${jobsToAnalyze.length} job postings. 
Identify the best matches.

Resume (excerpt):
${resume.rawText.substring(0, 2000)}...

Matched Jobs:
${jobsToAnalyze.map((job, idx) => `
Job #${idx + 1}:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location || "N/A"}
- Tags: ${job.tags?.join(", ") || "None"}
- Similarity: ${(job.score * 100).toFixed(1)}%
`).join("\n")}

Return a JSON object with a "recommendations" array.
For the top 3-5 suitable jobs, provide:
{
  "jobId": "...",
  "matchScore": 85,
  "mainReason": "...",
  "skillsMatched": ["..."],
  "skillsMissing": ["..."]
}

ONLY JSON.`;

  try {
    const result = await generateWithRetry(model, prompt);
    const text = result.response.text();
    
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    
    const recommendations = JSON.parse(jsonText);
    
    if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
      throw new Error("Invalid recommendations format");
    }
    
    return recommendations.recommendations;
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
};

export default {
  generateRecommendations,
};
