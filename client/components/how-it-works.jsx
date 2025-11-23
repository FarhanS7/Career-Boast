"use client";

import { motion } from "framer-motion";
import { CheckCircle, Download, Sparkles, Upload } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Info",
    description: "Share your experience, skills, and career goals with our AI assistant."
  },
  {
    icon: Sparkles,
    title: "AI Does the Magic",
    description: "Our advanced AI analyzes and optimizes your content for maximum impact."
  },
  {
    icon: Download,
    title: "Download & Apply",
    description: "Get your polished resume, cover letter, and interview prep materials instantly."
  },
  {
    icon: CheckCircle,
    title: "Land Your Dream Job",
    description: "Apply with confidence and track your success with our built-in tools."
  }
];

export function HowItWorks() {
  return (
    <section className="py-32 px-4 bg-black relative">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            How It Works
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Four simple steps to accelerate your career journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-white/20 to-transparent" />
              )}
              
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-12 h-12 text-blue-400" />
                </div>
                <div className="text-sm font-semibold text-blue-400 mb-2">Step {i + 1}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
