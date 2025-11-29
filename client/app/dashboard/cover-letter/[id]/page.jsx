"use client";

import { Button } from "@/components/ui/button";
import apiClient, { setAuthToken } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Copy, Download, Edit2, Loader2, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function CoverLetterDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const { getToken } = useAuth();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    const loadLetter = async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        const data = await apiClient.get(`/cover-letter/${id}`);
        setLetter(data);
        setEditedContent(data.content);
      } catch (error) {
        toast.error("Failed to load cover letter");
        console.error(error);
        router.push("/dashboard/cover-letter");
      } finally {
        setLoading(false);
      }
    };

    loadLetter();
  }, [id, getToken, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this cover letter?")) return;

    try {
      setDeleting(true);
      const token = await getToken();
      if (token) setAuthToken(token);
      await apiClient.delete(`/cover-letter/${id}`);
      toast.success("Cover letter deleted successfully");
      router.push("/dashboard/cover-letter");
    } catch (error) {
      toast.error("Failed to delete cover letter");
      console.error(error);
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      
      const updated = await apiClient.put(`/cover-letter/${id}`, {
        ...letter,
        content: editedContent,
      });
      
      setLetter(updated);
      setIsEditing(false);
      toast.success("Cover letter saved successfully");
    } catch (error) {
      toast.error("Failed to save cover letter");
      console.error(error);
    }
  };

  const handleCopy = () => {
    if (!letter?.content) return;
    navigator.clipboard.writeText(letter.content);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!letter?.content) return;
    const blob = new Blob([letter.content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${letter.companyName || "Draft"}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!letter) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/cover-letter")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {letter.jobTitle} at {letter.companyName}
            </h1>
            <p className="text-sm text-zinc-400">
              Generated on {new Date(letter.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(letter.content);
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-[600px] bg-transparent border-none focus:ring-0 text-zinc-300 font-mono resize-none p-0 leading-relaxed"
            placeholder="Start typing..."
          />
        ) : (
          <article className="prose prose-invert max-w-none">
            <ReactMarkdown>{letter.content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
