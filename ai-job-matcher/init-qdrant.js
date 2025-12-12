import "dotenv/config";
import { initializeCollections } from "./src/lib/qdrant.js";

initializeCollections()
  .then(() => {
    console.log("Collections initialized successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error initializing collections:", error);
    process.exit(1);
  });
