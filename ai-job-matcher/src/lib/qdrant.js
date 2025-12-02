import { QdrantClient } from "@qdrant/js-client-rest";

const VECTOR_SIZE = 768; // Updated for text-embedding-004 model

let qdrantClient = null;

export const getQdrantClient = () => {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });
  }
  return qdrantClient;
};

// Collection names
export const COLLECTIONS = {
  RESUMES: "resumes",
  JOBS: "jobs",
};

// Initialize Qdrant collections
export const initializeCollections = async () => {
  const client = getQdrantClient();

  try {
    // Check and create resumes collection
    const resumesExists = await client.collectionExists(COLLECTIONS.RESUMES);
    if (!resumesExists) {
      await client.createCollection(COLLECTIONS.RESUMES, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
      console.log(`Created collection: ${COLLECTIONS.RESUMES}`);
    }

    // Check and create jobs collection
    const jobsExists = await client.collectionExists(COLLECTIONS.JOBS);
    if (!jobsExists) {
      await client.createCollection(COLLECTIONS.JOBS, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
      console.log(`Created collection: ${COLLECTIONS.JOBS}`);
    }

    console.log("Qdrant collections initialized");
  } catch (error) {
    console.error("Error initializing Qdrant collections:", error);
    throw error;
  }
};

export default getQdrantClient;
