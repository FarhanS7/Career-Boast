import { Clerk } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";

dotenv.config();

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
  try {
    // Use an existing user ID (from your Clerk dashboard)
    const userId = "user_34pu1AjyO17umJnIeM3H9iI0lBb"; // replace with your user id

    const session = await clerk.sessions.create({ userId });
    console.log("Bearer token (session ID):", session.id);
  } catch (err) {
    console.error("Error generating token:", err);
  }
}

main();
