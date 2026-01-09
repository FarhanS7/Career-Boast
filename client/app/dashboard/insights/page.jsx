import { InsightsClient } from "@/components/insights-client";
import { getServerApi } from "@/lib/api-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function InsightsPage() {
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
    console.error("Insights Page User Fetch Error:", error);
  }

  if (user && (!user.industry || !user.subIndustry)) {
    redirect("/onboarding");
  }

  try {
    if (user) {
      insights = await api.dashboard.getIndustryInsights();
    }
  } catch (error) {
    console.error("Insights Page Fetch Error:", error);
  }

  return <InsightsClient initialUser={user} initialInsights={insights} />;
}
