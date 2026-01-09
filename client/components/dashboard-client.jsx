"use client";


export function DashboardClient({ user, stats }) {
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
          { 
              label: "Resumes Created", 
              value: stats?.resumes || 0, 
              color: "blue",
              description: "Total resumes in your profile"
          },
          { 
              label: "Cover Letters", 
              value: stats?.coverLetters || 0, 
              color: "green",
              description: "Custom letters generated"
          },
          { 
              label: "Interview Prep", 
              value: stats?.interviews || 0, 
              color: "purple",
              description: "Mock interviews completed"
          },
          { 
              label: "Industry", 
              value: user?.industry ? "Ready" : "Not Set", 
              color: "orange",
              description: user?.industry || "Set your industry"
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <p className="text-zinc-400 text-sm mb-2 group-hover:text-zinc-300 transition-colors">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-white">{stat.value}</p>
            </div>
            <p className="text-xs text-zinc-500 mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">Track Market Trends</h3>
          <p className="text-zinc-400 mb-6">
            Get real-time AI insights into your industry's hiring trends, salary ranges, and required skills.
          </p>
          <a 
            href="/dashboard/insights" 
            className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
          >
            View Insights →
          </a>
        </div>
        
        <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">Career Tools</h3>
          <p className="text-zinc-400 mb-6">
            Optimized tools to help you land your next role faster.
          </p>
          <div className="flex gap-4">
             <a href="/dashboard/resume" className="text-sm text-purple-400 hover:text-purple-300 underline font-medium">Resume Builder</a>
             <a href="/dashboard/ats" className="text-sm text-purple-400 hover:text-purple-300 underline font-medium">ATS Checker</a>
             <a href="/dashboard/interview" className="text-sm text-purple-400 hover:text-purple-300 underline font-medium">Mock Interview</a>
          </div>
        </div>
      </div>
    </div>
  );
}
