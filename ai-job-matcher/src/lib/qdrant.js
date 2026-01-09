import { QdrantClient } from "@qdrant/js-client-rest";

const VECTOR_SIZE = 768; 

let qdrantClient = null;

export const getQdrantClient = () => {
  if (!qdrantClient) {
    let url = process.env.QDRANT_URL;
    
    // Auto-fix for Qdrant Cloud: strip port 6333 if using https
    // Many cloud providers proxy 443 -> 6333 and don't expose 6333 externally.
    if (url && url.startsWith("https://") && url.includes(":6333")) {
      console.log("Qdrant: Auto-stripping port 6333 for cloud instance compatibility");
      url = url.replace(":6333", "");
    }

    console.log(`Qdrant: Initializing client with URL: ${url}`);
    qdrantClient = new QdrantClient({
      url,
      apiKey: process.env.QDRANT_API_KEY || undefined,
      checkCompatibility: false, // Disable to avoid extra 404s on cloud
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
    // Check collections by listing them (more robust than collectionExists on some cloud providers)
    const { collections } = await client.getCollections();
    const collectionNames = collections.map(c => c.name);

    // Check and create resumes collection
    if (!collectionNames.includes(COLLECTIONS.RESUMES)) {
      await client.createCollection(COLLECTIONS.RESUMES, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
      console.log(`Created collection: ${COLLECTIONS.RESUMES}`);
    }

    // Check and create jobs collection
    if (!collectionNames.includes(COLLECTIONS.JOBS)) {
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
    // Don't throw here - we want the server to start even if Qdrant is temporarily down
    // throw error; 
  }
};

export default getQdrantClient;
