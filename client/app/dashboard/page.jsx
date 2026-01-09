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
  let insights = null;

  try {
    const userData = await api.user.getMe();
    user = userData.user;
  } catch (error) {
    console.error("Dashboard User Fetch Error:", error);
  }

  // Handle redirect OUTSIDE of try/catch
  if (user && (!user.industry || !user.subIndustry)) {
    redirect("/onboarding");
  }

  try {
    if (user) {
      insights = await api.dashboard.getIndustryInsights();
    }
  } catch (error) {
    console.error("Dashboard Insights Fetch Error:", error);
  }

  return <DashboardClient initialUser={user} initialInsights={insights} />;
}
