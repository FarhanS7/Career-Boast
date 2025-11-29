"use client";

import { Button } from "@/components/ui/button";
import apiClient, { setAuthToken } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

export default function NewCoverLetterPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const response = await apiClient.post("/cover-letter", data);
      
      toast.success("Cover letter generated successfully!");
      router.push(`/dashboard/cover-letter/${response.id}`);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">New Cover Letter</h1>
          <p className="text-zinc-400">
            Generate a tailored cover letter for your job application
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Company Name
              </label>
              <input
                {...register("companyName")}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />
              {errors.companyName && (
                <p className="text-red-400 text-sm">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Job Title
              </label>
              <input
                {...register("jobTitle")}
                placeholder="e.g. Senior Developer"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />
              {errors.jobTitle && (
                <p className="text-red-400 text-sm">{errors.jobTitle.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Job Description
            </label>
            <textarea
              {...register("jobDescription")}
              rows={8}
              placeholder="Paste the job description here..."
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none resize-none"
            />
            {errors.jobDescription && (
              <p className="text-red-400 text-sm">
                {errors.jobDescription.message}
              </p>
            )}
            <p className="text-xs text-zinc-500">
              Our AI will analyze this to tailor your cover letter.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} size="lg" className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
