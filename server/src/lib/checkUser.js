import prisma from "./prisma.js";

export const checkUser = async (clerkUserId, clerkData) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (user) return user;

  if (!clerkData) return null;

  // Handle both frontend format (email, name) and Clerk format (firstName, lastName, emailAddresses)
  const email = clerkData.email || clerkData.emailAddresses?.[0]?.emailAddress;
  const name = clerkData.name || `${clerkData.firstName || ''} ${clerkData.lastName || ''}`.trim();
  
  if (!email) {
    throw new Error('Email is required to create a user');
  }

  return await prisma.user.create({
    data: {
      clerkUserId,
      name: name || 'User',
      imageUrl: clerkData.imageUrl,
      email,
    },
  });
};
