import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { inngestHandler } from "./inngest/inngest.controller.js";
import errorHandler from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());

// Inngest endpoint - must be before express.json()
app.use("/api/inngest", inngestHandler);

app.use(express.json());

// Health check endpoint (before authentication middleware)
app.get("/health", (req, res) => {
  const diagnostics = {
    status: "ok",
    timestamp: new Date().toISOString(),
    env_check: {
      has_database_url: !!process.env.DATABASE_URL,
      has_clerk_secret: !!process.env.CLERK_SECRET_KEY,
      has_clerk_pub: !!process.env.CLERK_PUBLISHABLE_KEY,
      has_gemini_key: !!process.env.GEMINI_API_KEY,
    }
  };
  console.log("Health Check Diagnostics:", diagnostics);
  res.status(200).json(diagnostics);
});

// Apply Clerk middleware globally
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

// All API routes
app.use("/api", routes);

// Global error handler
app.use(errorHandler);

export default app;
