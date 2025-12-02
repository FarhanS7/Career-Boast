import { getEmbeddingModel } from "../lib/gemini.js";

export const generateEmbedding = async (text) => {
  try {
    const model = getEmbeddingModel();
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

export const prepareResumeText = (resumeText) => {
  const cleaned = resumeText
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
};

export const prepareJobText = (job) => {
  const parts = [
    job.title,
    job.company,
    job.location || "",
    job.description,
    job.tags ? job.tags.join(", ") : "",
    job.jobType || "",
  ].filter(Boolean);
  
  return parts.join(" | ");
};

export default {
  generateEmbedding,
  prepareResumeText,
  prepareJobText,
};
