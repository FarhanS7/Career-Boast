"use client";

import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/utils/pdf-export";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import MinimalTemplate from "./templates/minimal";
import ModernTemplate from "./templates/modern";
import ProfessionalTemplate from "./templates/professional";

const templates = {
  professional: { name: "Professional", component: ProfessionalTemplate },
  modern: { name: "Modern", component: ModernTemplate },
  minimal: { name: "Minimal", component: MinimalTemplate },
};

export default function ResumePreview({ data, selectedTemplate, onTemplateChange }) {
  const previewRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [exporting, setExporting] = useState(false);

  const TemplateComponent = templates[selectedTemplate]?.component || ProfessionalTemplate;

  const handleExport = async () => {
    if (!previewRef.current) return;

    try {
      setExporting(true);
      const filename = `${data.personalInfo?.name?.replace(/\s+/g, "_") || "resume"}.pdf`;
      await exportToPDF(previewRef.current, filename);
      toast.success("Resume exported successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-zinc-900/50 border border-white/10 rounded-xl">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Template:</label>
          <select
            value={selectedTemplate}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
          >
            {Object.entries(templates).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-zinc-400 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 1.5}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <Button onClick={handleExport} disabled={exporting} size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto bg-zinc-800/50 rounded-xl p-8">
        <div
          className="mx-auto shadow-2xl"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease",
          }}
        >
          <div ref={previewRef}>
            <TemplateComponent data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
