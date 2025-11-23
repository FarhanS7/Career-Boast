import { serve } from "inngest/express";
import {
    generateCoverLetter,
    generateIndustryInsights,
    generateQuiz,
    improveResume,
} from "../inngest/functions.js";
import { inngest } from "../lib/inngest.js";

export const inngestHandler = serve({
  client: inngest,
  functions: [
    generateIndustryInsights,
    generateCoverLetter,
    generateQuiz,
    improveResume,
  ],
});
