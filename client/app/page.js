import { CTASection } from "@/components/cta-section";
import { FAQSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { StatsSection } from "@/components/stats-section";

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
