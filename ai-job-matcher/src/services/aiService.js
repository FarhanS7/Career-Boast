import { getGenerativeModel } from "../lib/gemini.js";

export const generateRecommendations = async (resume, matchedJobs) => {
  const model = getGenerativeModel();
  
  const prompt = `You are an expert career advisor and job matching AI. 

Analyze the resume and ${matchedJobs.length} pre-matched job postings. Provide structured recommendations for the TOP 10 BEST jobs.

For each recommended job, provide:
- Match score (0-100) based on skills, experience, and fit
- Main reason why this job is a good fit
- Skills from resume that match the job requirements
- Skills mentioned in job that are missing from resume

Resume:
${resume.rawText}

Matched Jobs:
${matchedJobs.map((job, idx) => `
Job #${idx + 1}:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location || "Not specified"}
- Description: ${job.description.substring(0, 500)}...
- Tags: ${job.tags?.join(", ") || "None"}
- Similarity Score: ${(job.score * 100).toFixed(1)}%
`).join("\n")}

Provide your recommendations in the following JSON format (ONLY JSON, no markdown):
{
  "recommendations": [
    {
      "jobId": "string (use the job's ID)",
      "matchScore": 85,
      "mainReason": "Strong alignment with required Python and ML skills...",
      "skillsMatched": ["Python", "TensorFlow", "AWS"],
      "skillsMissing": ["Kubernetes", "Go"]
    }
  ]
}

Return EXACTLY 10 recommendations, ordered by match score (highest first).`;

  try {
    const result = await model.generateContent(prompt);
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
