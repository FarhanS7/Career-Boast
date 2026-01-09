"use client";

import DashboardView from "@/components/dashboard-view";
import { api, setAuthToken } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function DashboardClient({ initialUser, initialInsights }) {
  const { getToken } = useAuth();
  const [insights, setInsights] = useState(initialInsights);
  const [isGenerating, setIsGenerating] = useState(initialInsights?.status === "generating");

  useEffect(() => {
    let pollTimer;
    let pollInterval = 3000;
    let attempts = 0;
    const maxAttempts = 10;

    const fetchInsights = async () => {
      // If we already have final insights, don't poll
      if (insights && insights.status !== "generating") return;

      if (initialUser?.industry && initialUser?.subIndustry) {
        try {
          const token = await getToken();
          if (token) setAuthToken(token);
          
          const data = await api.dashboard.getIndustryInsights();
          
          if (data.status === "generating") {
             setIsGenerating(true);
             attempts++;
             
             if (attempts > 5) pollInterval = 5000;
             if (attempts < maxAttempts) {
               pollTimer = setTimeout(fetchInsights, pollInterval);
             } else {
               setIsGenerating(false);
               console.warn("Max polling attempts reached for insights");
             }
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

    if (isGenerating) {
      fetchInsights();
    }

    return () => clearTimeout(pollTimer);
  }, [initialUser, getToken, insights, isGenerating]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {initialUser?.name?.split(" ")[0] || "there"}! 👋
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

      {/* Industry Insights */}
      {insights && insights.status !== "generating" ? (
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
                    Gathers real-time insights for {initialUser?.industry || "your industry"}. This takes just a moment.
                  </p>
                </>
            ) : (
                <>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Insights unavailable
                  </h2>
                  <p className="text-zinc-400">
                    We couldn't load your industry insights. Please try again later.
                  </p>
                </>
            )}
        </div>
      )}
    </div>
  );
}
