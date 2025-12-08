"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { jobApi } from "@/lib/api-client";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import JobCard from "./JobCard";

export default function JobRecommendations({ resumeId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobApi.recommendations.get(resumeId);
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      // Don't show error if it's just 404 (no recommendations yet)
      if (err.status !== 404) {
        setError("Failed to load recommendations");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      setGenerating(true);
      setError(null);
      const response = await jobApi.recommendations.generate(resumeId);
      setRecommendations(response.data.recommendations || []);
      toast.success("New recommendations generated!");
    } catch (err) {
      console.error("Error generating recommendations:", err);
      setError(err.message || "Failed to generate recommendations");
      toast.error("Failed to generate recommendations");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (resumeId) {
      fetchRecommendations();
    }
  }, [resumeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        </div>
        <p className="text-muted-foreground animate-pulse">Finding the best jobs for you...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Recommended Jobs
        </h2>
        <Button 
          onClick={generateRecommendations} 
          disabled={generating}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Analyzing..." : "Refresh Matches"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && recommendations.length === 0 && !error ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No recommendations yet</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            Click the button above to let our AI analyze your resume and find the perfect job matches for you.
          </p>
          <Button onClick={generateRecommendations} disabled={generating}>
            {generating ? "Analyzing..." : "Find Matches Now"}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <JobCard
              key={rec.id}
              job={rec.job}
              matchScore={rec.matchScore}
              explanation={rec.mainReason}
              skillsMatched={rec.skillsMatched}
              skillsMissing={rec.skillsMissing}
            />
          ))}
        </div>
      )}
    </div>
  );
}
