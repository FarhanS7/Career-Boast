"use client";

import MinimalTemplate from "@/components/resume/templates/minimal";
import ModernTemplate from "@/components/resume/templates/modern";
import ProfessionalTemplate from "@/components/resume/templates/professional";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/utils/pdf-export";
import { Download, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const templates = {
  professional: ProfessionalTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export default function ShareResumePage({ params }) {
  const { token } = params;
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [exporting, setExporting] = useState(false);
  const previewRef = React.useRef(null);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/share/${token}`);
        if (!response.ok) {
          throw new Error("Resume not found or sharing is disabled");
        }
        const data = await response.json();
        setResume(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [token]);

  const handleExport = async () => {
    if (!previewRef.current) return;

    try {
      setExporting(true);
      const filename = `${resume.personalInfo?.name?.replace(/\s+/g, "_") || "resume"}.pdf`;
      await exportToPDF(previewRef.current, filename);
      toast.success("Resume exported successfully!");
    } catch (error) {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Resume Not Found</h1>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  const TemplateComponent = templates[selectedTemplate] || ProfessionalTemplate;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {resume.personalInfo?.name}'s Resume
              </h1>
              <p className="text-sm text-zinc-400">Public View</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="professional">Professional</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
              </select>

              <Button onClick={handleExport} disabled={exporting} size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                {exporting ? "Exporting..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-zinc-800/50 rounded-xl p-8">
          <div className="mx-auto shadow-2xl" ref={previewRef}>
            <TemplateComponent data={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
