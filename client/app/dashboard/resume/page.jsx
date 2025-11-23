"use client";

import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { Edit, FileText, Loader2, Plus, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await apiClient.get("/resume");
      setResumes(response.data);
    } catch (error) {
      toast.error("Failed to load resumes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      setDeleting(id);
      await apiClient.delete(`/resume/${id}`);
      setResumes(resumes.filter((r) => r._id !== id));
      toast.success("Resume deleted successfully");
    } catch (error) {
      toast.error("Failed to delete resume");
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Resumes</h1>
          <p className="text-zinc-400 mt-1">Create and manage your professional resumes</p>
        </div>
        <Button onClick={() => router.push("/dashboard/resume/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Resume
        </Button>
      </div>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 border border-white/10 rounded-2xl">
          <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No resumes yet</h3>
          <p className="text-zinc-400 mb-6">Create your first resume to get started</p>
          <Button onClick={() => router.push("/dashboard/resume/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Resume
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {resume.personalInfo?.name || "Untitled Resume"}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {resume.personalInfo?.email || "No email"}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Experience:</span>
                  <span className="text-white">{resume.experience?.length || 0} entries</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Education:</span>
                  <span className="text-white">{resume.education?.length || 0} entries</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Skills:</span>
                  <span className="text-white">{resume.skills?.length || 0} skills</span>
                </div>
              </div>

              <div className="text-xs text-zinc-500 mb-4">
                Updated {new Date(resume.updatedAt).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/resume/${resume._id}`)}
                  className="flex-1 gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                {resume.shareToken && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/resume/share/${resume.shareToken}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Share link copied!");
                    }}
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(resume._id)}
                  disabled={deleting === resume._id}
                  className="text-red-400 hover:text-red-300"
                >
                  {deleting === resume._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
