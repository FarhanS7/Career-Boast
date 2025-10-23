// server/src/server.js
import dotenv from "dotenv";
import app from "./app.js";
import prisma from "./utils/prisma.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received: closing server`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Prisma disconnected. Exiting.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
