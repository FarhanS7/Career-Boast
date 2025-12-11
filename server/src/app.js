import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { inngestHandler } from "./inngest/inngest.controller.js";
import errorHandler from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());

// Inngest endpoint - must be before express.json()
app.use("/api/inngest", inngestHandler);

app.use(express.json());

// Health check endpoint (before authentication middleware)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
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
