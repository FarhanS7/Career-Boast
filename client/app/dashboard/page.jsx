import { DashboardClient } from "@/components/dashboard-client";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { getServerApi } from "@/lib/api-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function DashboardContent() {
  const { getToken } = await auth();
  const token = await getToken();
  const api = getServerApi(token);
  
  let user = null;
  let stats = null;

  try {
    const [userData, statsData] = await Promise.all([
      api.user.getMe(),
      api.dashboard.getStats()
    ]);
    
    user = userData.user;
    stats = statsData;
  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
  }

  if (user && (!user.industry || !user.subIndustry)) {
    redirect("/onboarding");
  }

  return <DashboardClient user={user} stats={stats} />;
}

export default async function DashboardHome() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
