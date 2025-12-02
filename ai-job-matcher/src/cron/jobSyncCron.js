import cron from "node-cron";
import * as jobController from "../controllers/jobController.js";

export const initJobSyncCron = () => {
  // Run every day at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("Running scheduled job sync...");
    
    try {
      const mockReq = { query: {} };
      const mockRes = {
        json: (data) => {
          console.log("Job sync completed:", data);
        },
        status: () => mockRes,
      };
      const mockNext = (error) => {
        console.error("Job sync failed:", error);
      };
      
      await jobController.syncJobs(mockReq, mockRes, mockNext);
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
  
  console.log("Job sync cron initialized (runs daily at 2:00 AM)");
};

export default initJobSyncCron;
