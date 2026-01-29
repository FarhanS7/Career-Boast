import { Briefcase, FileCheck, TrendingUp, Users } from "lucide-react";

const stats = [
  { icon: Users, value: "50K+", label: "Active Users" },
  { icon: FileCheck, value: "100K+", label: "Resumes Created" },
  { icon: Briefcase, value: "25K+", label: "Jobs Landed" },
  { icon: TrendingUp, value: "95%", label: "Success Rate" }
];

export function StatsSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="animate-fade-in-up text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Trusted by Professionals Worldwide
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Join thousands of job seekers who have transformed their careers with our AI-powered platform.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="animate-fade-in text-center group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
                <stat.icon className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-zinc-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
