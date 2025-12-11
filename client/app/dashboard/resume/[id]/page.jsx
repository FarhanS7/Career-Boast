"use client";

import ResumeForm from "@/components/resume/resume-form";
import ResumePreview from "@/components/resume/resume-preview";
import { Button } from "@/components/ui/button";
import apiClient, { setAuthToken } from "@/lib/api-client";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useUser } from "@/lib/hooks/use-user";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Copy, Loader2, Save, Share2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema
const resumeSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    location: z.string().optional(),
    website: z.string().optional(),
  }),
  summary: z.string().optional(),
  experience: z.array(
    z.object({
      company: z.string().min(1, "Company is required"),
      position: z.string().min(1, "Position is required"),
      location: z.string().optional(),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  education: z.array(
    z.object({
      institution: z.string().min(1, "Institution is required"),
      degree: z.string().min(1, "Degree is required"),
      field: z.string().min(1, "Field is required"),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().min(1, "End date is required"),
      gpa: z.string().optional(),
    })
  ).optional(),
  skills: z.string().optional(),
  certifications: z.string().optional(),
  languages: z.string().optional(),
});

export default function ResumePage({ params }) {
  const router = useRouter();
  const { id: resumeId } = use(params);
  const { user, loading: userLoading } = useUser();
  const { getToken } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        location: "",
        website: "",
      },
      summary: "",
      experience: [],
      education: [],
      skills: "",
      certifications: "",
      languages: "",
    },
  });

  const formData = watch();

  // Convert comma-separated strings to arrays for preview
  const previewData = {
    ...formData,
    skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
    certifications: formData.certifications ? formData.certifications.split(",").map((s) => s.trim()).filter(Boolean) : [],
    languages: formData.languages ? formData.languages.split(",").map((s) => s.trim()).filter(Boolean) : [],
  };

  // Load existing resume
  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId || resumeId === "new") {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/resume/${resumeId}`);
        const resume = response;

        // Convert arrays to comma-separated strings for form
        const formattedData = {
          ...resume,
          skills: resume.skills?.join(", ") || "",
          certifications: resume.certifications?.join(", ") || "",
          languages: resume.languages?.join(", ") || "",
        };

        reset(formattedData);
        if (resume.shareToken) {
          setShareUrl(`${window.location.origin}/resume/share/${resume.shareToken}`);
        }
      } catch (error) {
        toast.error("Failed to load resume");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [resumeId, reset]);

  // Auto-save with debouncing
  const debouncedFormData = useDebounce(formData, 2000);

  useEffect(() => {
    if (!loading && debouncedFormData && resumeId && resumeId !== "new") {
      saveResume(debouncedFormData, true);
    }
  }, [debouncedFormData]);

  const saveResume = async (data, isAutoSave = false) => {
    try {
      if (!isAutoSave) setSaving(true);

      const token = await getToken();
      if (token) setAuthToken(token);

      // Convert comma-separated strings to arrays
      const formattedData = {
        ...data,
        skills: data.skills ? data.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        certifications: data.certifications ? data.certifications.split(",").map((s) => s.trim()).filter(Boolean) : [],
        languages: data.languages ? data.languages.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };

      let response;
      if (resumeId && resumeId !== "new") {
        response = await apiClient.put(`/resume/${resumeId}`, formattedData);
      } else {
        response = await apiClient.post("/resume", formattedData);
        // Redirect to the new resume ID
        router.replace(`/dashboard/resume/${response.id}`);
      }

      if (!isAutoSave) {
        toast.success("Resume saved successfully!");
      }
    } catch (error) {
      if (!isAutoSave) {
        toast.error(error.response?.data?.message || "Failed to save resume");
      }
      console.error(error);
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  };

  const handleImprove = async () => {
    if (!resumeId || resumeId === "new") {
      toast.error("Please save your resume first");
      return;
    }

    const currentSummary = formData.summary;
    if (!currentSummary || currentSummary.trim().length === 0) {
      toast.error("Please add a summary to improve");
      return;
    }

    try {
      setImproving(true);
      const token = await getToken();
      if (token) setAuthToken(token);
      
      // Send the current summary text and type for AI improvement
      const response = await apiClient.post(`/resume/${resumeId}/improve`, {
        current: currentSummary,
        type: "summary"
      });
      
      const improvedSummary = response.improved;

      // Update only the summary field
      reset({
        ...formData,
        summary: improvedSummary,
      });
      
      toast.success("Summary improved with AI suggestions!");
    } catch (error) {
      toast.error(error.message || "Failed to improve resume");
      console.error(error);
    } finally {
      setImproving(false);
    }
  };

  const handleShare = async () => {
    if (!resumeId || resumeId === "new") {
      toast.error("Please save your resume first");
      return;
    }

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      const response = await apiClient.post(`/resume/${resumeId}/share`);
      const url = `${window.location.origin}/resume/share/${response.shareToken}`;
      setShareUrl(url);
      toast.success("Share link generated!");
    } catch (error) {
      toast.error("Failed to generate share link");
      console.error(error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-white">Resume Builder</h1>
                <p className="text-sm text-zinc-400">
                  {resumeId === "new" ? "Create new resume" : "Edit resume"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {shareUrl && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-sm w-64"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                disabled={!resumeId || resumeId === "new"}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleImprove}
                disabled={improving || !resumeId || resumeId === "new"}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {improving ? "Improving..." : "AI Improve"}
              </Button>

              <Button
                onClick={handleSubmit((data) => saveResume(data, false))}
                disabled={saving}
                size="sm"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Form */}
          <div className="overflow-auto pr-4">
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
              <ResumeForm
                register={register}
                control={control}
                errors={errors}
                watch={watch}
              />
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="overflow-hidden">
            <ResumePreview
              data={previewData}
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
