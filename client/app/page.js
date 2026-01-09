import { Hero } from "@/components/hero";
import dynamic from "next/dynamic";

// Lazy load non-critical sections
const FeaturesSection = dynamic(() => import("@/components/features-section").then(mod => mod.FeaturesSection), {
  loading: () => <div className="h-96 animate-pulse bg-zinc-900/20" />,
});
const StatsSection = dynamic(() => import("@/components/stats-section").then(mod => mod.StatsSection), {
  loading: () => <div className="h-64 animate-pulse bg-zinc-900/20" />,
});
const HowItWorks = dynamic(() => import("@/components/how-it-works").then(mod => mod.HowItWorks), {
  loading: () => <div className="h-96 animate-pulse bg-zinc-900/20" />,
});
const FAQSection = dynamic(() => import("@/components/faq-section").then(mod => mod.FAQSection), {
  loading: () => <div className="h-96 animate-pulse bg-zinc-900/20" />,
});
const CTASection = dynamic(() => import("@/components/cta-section").then(mod => mod.CTASection), {
  loading: () => <div className="h-64 animate-pulse bg-zinc-900/20" />,
});
const Footer = dynamic(() => import("@/components/footer").then(mod => mod.Footer));

export default function Home() {
  return (
    <main className="min-h-screen bg-black selection:bg-white/20">
      <Hero />
      <FeaturesSection />
      <StatsSection />
      <HowItWorks />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
