import cron from "node-cron";
import * as jobController from "../controllers/jobController.js";

let isSyncing = false;

const performSync = async () => {
  if (isSyncing) {
    console.log("⏭️  Job sync already in progress, skipping...");
    return;
  }
  
  isSyncing = true;
  console.log("🔄 Running scheduled job sync...");
  
  try {
    const mockReq = { query: {} };
    const mockRes = {
      json: (data) => {
        console.log("✅ Job sync completed:", data);
        isSyncing = false;
      },
      status: () => mockRes,
    };
    const mockNext = (error) => {
      console.error("❌ Job sync failed:", error);
      isSyncing = false;
    };
    
    await jobController.syncJobs(mockReq, mockRes, mockNext);
  } catch (error) {
    console.error("❌ Cron job error:", error);
    isSyncing = false;
  }
};

export const initJobSyncCron = () => {
  // Run every 6 hours to keep jobs fresh
  cron.schedule("0 */6 * * *", performSync);
  
  console.log("✅ Job sync cron initialized (runs every 6 hours)");
  
  // Run initial sync after 30 seconds on server startup
  console.log("⏳ Initial job sync will run in 30 seconds...");
  setTimeout(() => {
    performSync();
  }, 30000);
};

export default initJobSyncCron;
