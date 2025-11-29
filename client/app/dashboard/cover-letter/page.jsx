"use client";

import { Button } from "@/components/ui/button";
import apiClient, { setAuthToken } from "@/lib/api-client";
import { useUser } from "@/lib/hooks/use-user";
import { useAuth } from "@clerk/nextjs";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CoverLetterPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { getToken } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (user && !userLoading) {
      loadCoverLetters();
    }
  }, [user, userLoading]);

  const loadCoverLetters = async () => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      const data = await apiClient.get("/cover-letter");
      setLetters(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load cover letters");
      console.error(error);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this cover letter?")) return;

    try {
      setDeleting(id);
      const token = await getToken();
      if (token) setAuthToken(token);
      await apiClient.delete(`/cover-letter/${id}`);
      setLetters(letters.filter((l) => l.id !== id));
      toast.success("Cover letter deleted successfully");
    } catch (error) {
      toast.error("Failed to delete cover letter");
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
          <h1 className="text-3xl font-bold text-white">My Cover Letters</h1>
          <p className="text-zinc-400 mt-1">Manage your tailored cover letters</p>
        </div>
        <Button onClick={() => router.push("/dashboard/cover-letter/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New
        </Button>
      </div>

      {/* Letters Grid */}
      {letters.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 border border-white/10 rounded-2xl">
          <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No cover letters yet</h3>
          <p className="text-zinc-400 mb-6">Create your first cover letter to get started</p>
          <Button onClick={() => router.push("/dashboard/cover-letter/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Cover Letter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.map((letter) => (
            <div
              key={letter.id}
              className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-colors group cursor-pointer"
              onClick={() => router.push(`/dashboard/cover-letter/${letter.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">
                    {letter.jobTitle || "Untitled Position"}
                  </h3>
                  <p className="text-sm text-zinc-400 truncate">
                    {letter.companyName || "Unknown Company"}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>

              <div className="text-xs text-zinc-500 mb-4">
                Created {new Date(letter.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/cover-letter/${letter.id}`);
                  }}
                  className="flex-1"
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(letter.id);
                  }}
                  disabled={deleting === letter.id}
                  className="text-red-400 hover:text-red-300"
                >
                  {deleting === letter.id ? (
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
