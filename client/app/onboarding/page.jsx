"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/use-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema matching backend
const onboardingSchema = z.object({
  industry: z.string().min(1, "Please select an industry"),
  subIndustry: z.string().min(1, "Please select a specialization"),
  experience: z.number().min(0).max(50),
  skills: z.string().optional(),
  bio: z.string().max(500).optional(),
});

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Sales",
  "Engineering",
  "Design",
  "Other",
];

const subIndustries = {
  Technology: ["Software Development", "Data Science", "DevOps", "Cybersecurity", "AI/ML"],
  Healthcare: ["Nursing", "Medical", "Pharmacy", "Healthcare Admin"],
  Finance: ["Accounting", "Investment Banking", "Financial Analysis", "Fintech"],
  Education: ["Teaching", "Administration", "Curriculum Development"],
  Marketing: ["Digital Marketing", "Content Marketing", "SEO/SEM", "Brand Management"],
  Sales: ["B2B Sales", "B2C Sales", "Account Management", "Business Development"],
  Engineering: ["Mechanical", "Electrical", "Civil", "Chemical"],
  Design: ["UI/UX", "Graphic Design", "Product Design", "Motion Graphics"],
  Other: ["General"],
};

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUser } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      experience: 0,
    },
  });

  const selectedIndustry = watch("industry");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Convert skills string to array
      const formattedData = {
        ...data,
        skills: data.skills ? data.skills.split(",").map((s) => s.trim()) : [],
      };

      await updateUser(formattedData);
      toast.success("Profile completed successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Let's personalize your experience</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Complete Your Profile
          </h1>
          <p className="text-zinc-400">
            Tell us about yourself to get personalized career insights
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
                  i <= step ? "bg-blue-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-zinc-400 text-center">
            Step {step} of 3
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {/* Step 1: Industry */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    What's your industry?
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Industry *
                      </label>
                      <select
                        {...register("industry")}
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select an industry</option>
                        {industries.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                      {errors.industry && (
                        <p className="text-red-400 text-sm mt-1">{errors.industry.message}</p>
                      )}
                    </div>

                    {selectedIndustry && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Specialization *
                        </label>
                        <select
                          {...register("subIndustry")}
                          className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select a specialization</option>
                          {subIndustries[selectedIndustry]?.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                        {errors.subIndustry && (
                          <p className="text-red-400 text-sm mt-1">{errors.subIndustry.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!selectedIndustry}
                    className="w-full gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Experience & Skills */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Your experience
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Years of Experience *
                      </label>
                      <input
                        type="number"
                        {...register("experience", { valueAsNumber: true })}
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                        min="0"
                        max="50"
                      />
                      {errors.experience && (
                        <p className="text-red-400 text-sm mt-1">{errors.experience.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Key Skills (comma-separated)
                      </label>
                      <input
                        type="text"
                        {...register("skills")}
                        placeholder="e.g., JavaScript, React, Node.js"
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex-1 gap-2">
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Bio */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Tell us about yourself
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Professional Bio (Optional)
                      </label>
                      <textarea
                        {...register("bio")}
                        rows={5}
                        placeholder="A brief summary of your professional background and career goals..."
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-zinc-500 mt-1">
                        {watch("bio")?.length || 0}/500 characters
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Completing..." : "Complete Profile"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  );
}
