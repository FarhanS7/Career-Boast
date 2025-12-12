import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

// Log to confirm restart and env loading
console.log("Server restarting... Gemini Model switched to 1.5-flash");
console.log("Gemini Key ends with:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(-4) : "NOT SET");


// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
        .split(",")
        .map(url => url.trim().replace(/\/$/, ""));
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.includes("localhost")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
