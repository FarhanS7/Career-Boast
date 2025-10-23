// HANDY-SERVER/src/lib/checkUser.js
import { db } from "./prisma.js";

export const checkUser = async (clerkUserId, clerkData) => {
  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (user) return user;

  if (!clerkData) return null;

  const name = `${clerkData.firstName} ${clerkData.lastName}`;
  return await db.user.create({
    data: {
      clerkUserId,
      name,
      imageUrl: clerkData.imageUrl,
      email: clerkData.emailAddresses[0].emailAddress,
    },
  });
};
