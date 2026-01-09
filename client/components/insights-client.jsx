"use client";

import DashboardView from "@/components/dashboard-view";
import { api, setAuthToken } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function InsightsClient({ initialUser, initialInsights }) {
  const { getToken } = useAuth();
  const [insights, setInsights] = useState(initialInsights);
  const [isGenerating, setIsGenerating] = useState(initialInsights?.status === "generating");

  useEffect(() => {
    let pollTimer;
    let pollInterval = 3000;
    let attempts = 0;
    const maxAttempts = 20; // Allow more attempts for slow AI

    const fetchInsights = async () => {
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

    if (isGenerating || initialInsights?.status === "generating") {
      fetchInsights();
    }

    return () => clearTimeout(pollTimer);
  }, [initialUser, getToken, insights, isGenerating, initialInsights]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Market Trends & Insights
        </h1>
        <p className="text-zinc-400">
          Real-time AI analysis for {initialUser?.industry} ({initialUser?.subIndustry}).
        </p>
      </div>

      {insights && insights.status !== "generating" ? (
        <DashboardView insights={insights} />
      ) : (
        <div className="p-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex flex-col items-center text-center">
            {isGenerating || initialInsights?.status === "generating" ? (
                <>
                  <div className="animate-pulse mb-6 p-4 bg-blue-500/20 rounded-full">
                     <span className="text-4xl">🧠</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    AI is analyzing current market trends...
                  </h2>
                  <p className="text-zinc-400 max-w-md">
                    Gathers real-time insights for your industry. This might take 30-60 seconds as we process live market data.
                  </p>
                  <div className="mt-8 w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-progress"></div>
                  </div>
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
