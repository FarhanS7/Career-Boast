import dotenv from "dotenv";
import app from "./app.js";
import { initJobSyncCron } from "./cron/jobSyncCron.js";
import { initializeCollections } from "./lib/qdrant.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4001;

// Initialize cron jobs
initJobSyncCron();

// Initialize Qdrant collections on startup
initializeCollections()
  .then(() => {
    console.log("Qdrant initialized successfully");
  })
  .catch((error) => {
    console.error("Failed to initialize Qdrant:", error);
    console.warn("Server will continue, but vector operations may fail");
  });

// Start server
app.listen(PORT, () => {
  console.log(`AI Job Matcher Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  process.exit(0);
});
