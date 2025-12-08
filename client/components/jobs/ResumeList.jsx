"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobApi } from "@/lib/api-client";
import { format } from "date-fns";
import { FileText, Loader2, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ResumeList({ onSelectResume }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchResumes = async () => {
    try {
      const response = await jobApi.resumes.list();
      setResumes(response.data.resumes || []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;

    setDeletingId(id);
    try {
      await jobApi.resumes.delete(id);
      setResumes(resumes.filter((r) => r.id !== id));
      toast.success("Resume deleted successfully");
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No resumes found</h3>
        <p className="text-muted-foreground mt-2">
          Upload a resume to start matching with jobs.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {resumes.map((resume) => (
        <Card 
          key={resume.id} 
          className="cursor-pointer hover:border-primary transition-colors group relative"
          onClick={() => onSelectResume(resume)}
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium line-clamp-1" title={resume.title}>
              {resume.title || "Untitled Resume"}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Uploaded: {format(new Date(resume.createdAt), "MMM d, yyyy")}</p>
              <p>{resume.fileName}</p>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectResume(resume);
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Find Jobs
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDelete(resume.id, e)}
                disabled={deletingId === resume.id}
              >
                {deletingId === resume.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
