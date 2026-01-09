import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  try {
    const count = await prisma.jobPosting.count();
    console.log("Total Job Postings:", count);
    
    if (count > 0) {
      const latest = await prisma.jobPosting.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { title: true, company: true, source: true }
      });
      console.log("Latest Jobs:", JSON.stringify(latest, null, 2));
    }
  } catch (err) {
    console.error("Database check failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
