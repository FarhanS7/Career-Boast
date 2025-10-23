// server/src/utils/prisma.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["warn", "error"], // enable query logging selectively
});

export default prisma;
