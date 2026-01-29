import { DashboardClient } from "@/components/dashboard-client";
import { getServerApi } from "@/lib/api-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const { userId, getToken } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const token = await getToken();
  const api = getServerApi(token);
  
  let user = null;
  let stats = null;

  try {
    // Parallelize fetches to avoid waterfall
    const [userData, statsData] = await Promise.all([
      api.user.getMe(),
      api.dashboard.getStats()
    ]);
    
    user = userData.user;
    stats = statsData;
  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
  }

  // Handle redirect OUTSIDE of try/catch
  if (user && (!user.industry || !user.subIndustry)) {
    redirect("/onboarding");
  }

  return <DashboardClient user={user} stats={stats} />;
}
