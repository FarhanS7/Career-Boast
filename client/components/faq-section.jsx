"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How does the AI resume builder work?",
    answer: "Our AI analyzes your experience and skills, then generates a professional, ATS-friendly resume tailored to your target role. It highlights your strengths and formats everything perfectly."
  },
  {
    question: "Can I customize the generated content?",
    answer: "Absolutely! All AI-generated content is fully editable. Use our intuitive editor to make any changes, add personal touches, or adjust the tone to match your style."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All your data is encrypted and stored securely. We never share your information with third parties without your explicit consent."
  },
  {
    question: "What file formats are supported?",
    answer: "You can download your resume and cover letters in PDF, DOCX, and TXT formats. Our documents are optimized for both human readers and ATS systems."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! You can create your first resume and cover letter for free. Premium features like unlimited documents and advanced AI insights are available with our paid plans."
  }
];

function FAQItem({ faq, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border-b border-white/10 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors pr-8">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-zinc-400 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-zinc-400 leading-relaxed">{faq.answer}</p>
      </motion.div>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section className="py-32 px-4 bg-gradient-to-b from-black to-zinc-950">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-lg">
            Everything you need to know about CareerCoach AI.
          </p>
        </motion.div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
