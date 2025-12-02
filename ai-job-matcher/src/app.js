import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (before authentication)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ai-job-matcher",
    timestamp: new Date().toISOString(),
  });
});

// Apply Clerk middleware globally
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

// API routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
