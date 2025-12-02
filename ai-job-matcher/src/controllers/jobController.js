import prisma from "../lib/prisma.js";
import * as embeddingService from "../services/embeddingService.js";
import * as jobService from "../services/jobService.js";
import * as vectorService from "../services/vectorService.js";

/**
 * Get all jobs with pagination and filters
 */
export const getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, source, jobType, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (source) {
      where.source = source;
    }
    
    if (jobType) {
      where.jobType = jobType;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          externalId: true,
          source: true,
          title: true,
          company: true,
          location: true,
          url: true,
          tags: true,
          jobType: true,
          salary: true,
          postedAt: true,
          createdAt: true,
        },
      }),
      prisma.jobPosting.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually trigger job sync (for testing/development)
 */
export const syncJobs = async (req, res, next) => {
  try {
    console.log("Starting manual job sync...");

    const fetchedJobs = await jobService.fetchAllJobs();

    if (fetchedJobs.length === 0) {
      return res.json({
        message: "No jobs fetched from APIs",
        stats: {
          fetched: 0,
          created: 0,
          updated: 0,
        },
      });
    }

    let created = 0;
    let updated = 0;
    const jobsToEmbed = [];

    // Process each job
    for (const jobData of fetchedJobs) {
      try {
        const existing = await prisma.jobPosting.findUnique({
          where: {
            externalId_source: {
              externalId: jobData.externalId,
              source: jobData.source,
            },
          },
        });

        let job;
        if (existing) {
          // Update existing job
          job = await prisma.jobPosting.update({
            where: { id: existing.id },
            data: jobData,
          });
          updated++;
        } else {
          // Create new job
          job = await prisma.jobPosting.create({
            data: jobData,
          });
          created++;
        }

        jobsToEmbed.push(job);
      } catch (error) {
        console.error(`Error processing job ${jobData.externalId}:`, error.message);
      }
    }

    // Generate embeddings and store in Qdrant
    console.log(`Generating embeddings for ${jobsToEmbed.length} jobs...`);
    
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

    // Batch upsert to Qdrant
    if (embeddedJobs.length > 0) {
      await vectorService.batchUpsertJobVectors(embeddedJobs);
      console.log(`Uploaded ${embeddedJobs.length} vectors to Qdrant`);
    }

    res.json({
      message: "Job sync completed successfully",
      stats: {
        fetched: fetchedJobs.length,
        created,
        updated,
        embedded: embeddedJobs.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single job by ID
 */
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.jobPosting.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

export default {
  getJobs,
  syncJobs,
  getJobById,
};
