import getQdrantClient, { COLLECTIONS } from "../lib/qdrant.js";

export const upsertResumeVector = async (resumeId, vector, metadata = {}) => {
  const client = getQdrantClient();
  
  await client.upsert(COLLECTIONS.RESUMES, {
    wait: true,
    points: [
      {
        id: resumeId,
        vector,
        payload: {
          resumeId,
          ...metadata,
        },
      },
    ],
  });
};

export const upsertJobVector = async (jobId, vector, metadata = {}) => {
  const client = getQdrantClient();
  
  await client.upsert(COLLECTIONS.JOBS, {
    wait: true,
    points: [
      {
        id: jobId,
        vector,
        payload: {
          jobId,
          ...metadata,
        },
      },
    ],
  });
};

export const searchSimilarJobs = async (resumeVector, topK = 30) => {
  const client = getQdrantClient();
  
  const searchResult = await client.search(COLLECTIONS.JOBS, {
    vector: resumeVector,
    limit: topK,
    with_payload: true,
  });
  
  return searchResult.map((result) => ({
    jobId: result.id,
    score: result.score,
    ...result.payload,
  }));
};

export const deleteResumeVector = async (resumeId) => {
  const client = getQdrantClient();
  try {
    await client.delete(COLLECTIONS.RESUMES, {
      wait: true,
      points: [resumeId],
    });
  } catch (error) {
    // If the ID is invalid (e.g. CUID vs UUID) or not found, just log and ignore
    // so we don't block the database deletion.
    console.warn(`Warning: Failed to delete resume vector ${resumeId} (might not exist or invalid ID): ${error.message}`);
  }
};

export const getResumeVector = async (resumeId) => {
  const client = getQdrantClient();
  try {
    const results = await client.retrieve(COLLECTIONS.RESUMES, {
      ids: [resumeId],
      with_vector: true,
    });
    
    if (results && results.length > 0) {
      return results[0].vector;
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving vector for resume ${resumeId}:`, error.message);
    return null;
  }
};

export const deleteJobVector = async (jobId) => {
  const client = getQdrantClient();
  try {
    await client.delete(COLLECTIONS.JOBS, {
      wait: true,
      points: [jobId],
    });
  } catch (error) {
    console.warn(`Warning: Failed to delete job vector ${jobId}: ${error.message}`);
  }
};

export const batchUpsertJobVectors = async (jobs) => {
  const client = getQdrantClient();
  
  const points = jobs.map((job) => ({
    id: job.id,
    vector: job.vector,
    payload: {
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.url,
    },
  }));
  
  await client.upsert(COLLECTIONS.JOBS, {
    wait: true,
    points,
  });
};

export default {
  upsertResumeVector,
  upsertJobVector,
  searchSimilarJobs,
  deleteResumeVector,
  deleteJobVector,
  batchUpsertJobVectors,
};
