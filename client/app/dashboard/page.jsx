"use client";

import DashboardView from "@/components/dashboard-view";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { api, setAuthToken } from "@/lib/api-client";
import { useUser } from "@/lib/hooks/use-user";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardHome() {
  const router = useRouter();
  const { user, loading, needsOnboarding } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!loading && needsOnboarding) {
      router.push("/onboarding");
    }
  }, [loading, needsOnboarding, router]);

  const [insights, setInsights] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let pollTimer;

    const fetchInsights = async () => {
      if (user?.industry && user?.subIndustry) {
        try {
          const token = await getToken();
          if (token) setAuthToken(token);
          
          const data = await api.dashboard.getIndustryInsights();
          
          if (data.status === "generating") {
             setIsGenerating(true);
             // Poll again in 3 seconds
             pollTimer = setTimeout(fetchInsights, 3000);
          } else {
             setInsights(data);
             setIsGenerating(false);
          }
        } catch (error) {
          console.error(error);
          setIsGenerating(false);
        }
      }
    };

    fetchInsights();

    return () => clearTimeout(pollTimer);
  }, [user, getToken]);

  if (loading) {
    return <LoadingPage message="Loading your dashboard..." />;
  }

  if (needsOnboarding) {
    return <LoadingPage message="Redirecting to onboarding..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-zinc-400">
          Here's what's happening with your career journey today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Resumes Created", value: "0", color: "blue" },
          { label: "Cover Letters", value: "0", color: "green" },
          { label: "Interview Preps", value: "0", color: "purple" },
          { label: "Applications", value: "0", color: "orange" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/20 transition-colors"
          >
            <p className="text-zinc-400 text-sm mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Build Resume",
              description: "Create a professional resume",
              href: "/dashboard/resume",
              icon: "📄",
            },
            {
              title: "Write Cover Letter",
              description: "Generate tailored cover letters",
              href: "/dashboard/cover-letter",
              icon: "✍️",
            },
            {
              title: "Practice Interview",
              description: "Prepare with AI questions",
              href: "/dashboard/interview",
              icon: "🎯",
            },
          ].map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/20 hover:bg-zinc-900/70 transition-all"
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-zinc-400">{action.description}</p>
            </a>
          ))}
        </div>
      </div> */}

      {/* Industry Insights */}
      {insights ? (
        <DashboardView insights={insights} />
      ) : (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex flex-col items-center text-center">
            {isGenerating ? (
                <>
                  <div className="animate-pulse mb-4 p-3 bg-blue-500/20 rounded-full">
                     <span className="text-3xl">🧠</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    AI is analyzing current market trends...
                  </h2>
                  <p className="text-zinc-400">
                    Gathers real-time insights for {user?.industry || "your industry"}. This takes just a moment.
                  </p>
                </>
            ) : (
                <>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Loading Insights...
                  </h2>
                </>
            )}
        </div>
      )}
    </div>
  );
}
