import { BrainCircuit, FileText, LineChart, MessageSquare } from "lucide-react";

const features = [
  {
    title: "AI-Powered Resume Builder",
    description: "Transform your experience into a professional, ATS-friendly resume in seconds. Our AI analyzes your background to highlight your strengths.",
    icon: FileText,
    className: "md:col-span-2",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    title: "Smart Cover Letters",
    description: "Generate tailored cover letters for every job application. Just paste the job description and let AI do the rest.",
    icon: MessageSquare,
    className: "md:col-span-1",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    title: "Interview Prep",
    description: "Practice with AI-generated questions specific to your industry and role. Get real-time feedback on your answers.",
    icon: BrainCircuit,
    className: "md:col-span-1",
    gradient: "from-orange-500/20 to-red-500/20"
  },
  {
    title: "Industry Insights",
    description: "Stay ahead of the curve with real-time industry trends, salary data, and skill requirements.",
    icon: LineChart,
    className: "md:col-span-2",
    gradient: "from-pink-500/20 to-rose-500/20"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-32 px-4 bg-black relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="animate-fade-in-up text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Powerful Features for Your Career
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Everything you need to land your dream job, powered by advanced artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`animate-fade-in-up relative group p-8 rounded-3xl bg-zinc-900/50 border border-white/10 overflow-hidden hover:border-white/20 transition-colors ${feature.className}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
