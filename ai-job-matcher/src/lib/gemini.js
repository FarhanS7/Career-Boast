import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

export const getGeminiClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// Get embedding model
export const getEmbeddingModel = () => {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({ model: "text-embedding-004" });
};

// Get generative model for recommendations
export const getGenerativeModel = () => {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
};

export default getGeminiClient;
