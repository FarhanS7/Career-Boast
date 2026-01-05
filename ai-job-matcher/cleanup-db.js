
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanJobPostings() {
  try {
    console.log("Cleaning up Adzuna, Jobicy, Remotive, Reed, and USAJobs...");
    const { count } = await prisma.jobPosting.deleteMany({
      where: {
        source: {
          in: ["adzuna", "jobicy", "remotive", "reed", "usajobs", "seed"]
        }
      }
    });
    console.log(`Deleted ${count} old job postings.`);
  } catch (error) {
    console.error("Error cleaning DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanJobPostings();
