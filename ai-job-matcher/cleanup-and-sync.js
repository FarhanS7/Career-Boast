import { PrismaClient } from "@prisma/client";
import * as embeddingService from "./src/services/embeddingService.js";
import { fetchAllJobs } from "./src/services/jobService.js";
import * as vectorService from "./src/services/vectorService.js";

const prisma = new PrismaClient();

async function cleanupAndSync() {
  try {
    // Step 1: Delete ALL existing jobs
    console.log("🗑️  Deleting all existing job postings...");
    const { count } = await prisma.jobPosting.deleteMany({});
    console.log(`✅ Deleted ${count} old job postings.`);
    
    // Step 2: Fetch fresh jobs from RemoteOK and We Work Remotely
    console.log("\n🔄 Fetching fresh jobs from RemoteOK and We Work Remotely...");
    const freshJobs = await fetchAllJobs();
    console.log(`✅ Fetched ${freshJobs.length} jobs.`);
    
    // Step 3: Save to database
    console.log("\n💾 Saving jobs to database...");
    let created = 0;
    const jobsToEmbed = [];
    
    for (const jobData of freshJobs) {
      try {
        const job = await prisma.jobPosting.create({
          data: jobData,
        });
        created++;
        jobsToEmbed.push(job);
      } catch (error) {
        console.error(`Error saving job ${jobData.externalId}:`, error.message);
      }
    }
    
    console.log(`✅ Saved ${created} jobs to database.`);
    
    // Step 4: Generate embeddings
    console.log("\n🧠 Generating embeddings...");
    const embeddedJobs = [];
    for (const job of jobsToEmbed) {
      try {
        const preparedText = embeddingService.prepareJobText(job);
        const embedding = await embeddingService.generateEmbedding(preparedText);
        
        embeddedJobs.push({
          id: job.id,
          vector: embedding,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
        });
      } catch (error) {
        console.error(`Error embedding job ${job.id}:`, error.message);
      }
    }
    
    // Step 5: Upload to Qdrant
    if (embeddedJobs.length > 0) {
      await vectorService.batchUpsertJobVectors(embeddedJobs);
      console.log(`✅ Uploaded ${embeddedJobs.length} vectors to Qdrant.`);
    }
    
    console.log("\n✨ Cleanup and sync completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during cleanup and sync:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAndSync();
