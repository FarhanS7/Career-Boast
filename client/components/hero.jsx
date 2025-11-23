"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white pt-20"
    >
      {/* Background Gradient / Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      
      <motion.div 
        style={{ y, opacity }}
        className="container mx-auto px-4 relative z-10 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>AI-Powered Career Growth</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50"
        >
          Master Your <br />
          Career Journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Professional resume building, AI-driven cover letters, and expert interview prep. 
          Elevate your potential with the ultimate career co-pilot.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <button className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-zinc-200 transition-all duration-300 flex items-center gap-2 overflow-hidden">
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
          
          <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
            View Demo
          </button>
        </motion.div>
      </motion.div>

      {/* Floating UI Elements (Mockup) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.8, type: "spring" }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-[90%] max-w-5xl aspect-video bg-zinc-900/80 rounded-t-3xl border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-20" />
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="h-6 w-64 bg-white/5 rounded-full" />
        </div>
        <div className="p-8 grid grid-cols-3 gap-6 opacity-50">
           {/* Mock Content */}
           <div className="col-span-1 h-64 bg-white/5 rounded-xl border border-white/5" />
           <div className="col-span-2 h-64 bg-white/5 rounded-xl border border-white/5" />
        </div>
      </motion.div>
    </section>
  );
}
