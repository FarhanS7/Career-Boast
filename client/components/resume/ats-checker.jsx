"use client";

import { Button } from "@/components/ui/button";
import { api, setAuthToken } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import {
    AlertCircle,
    CheckCircle2,
    FileSearch,
    Loader2,
    Sparkles,
    Target,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ATSChecker() {
  const { getToken } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheckScore = async () => {
    if (jobDescription.length < 50) {
      toast.error("Job description must be at least 50 characters");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const data = await api.resume.checkATSScore(jobDescription);
      setResult(data);
      toast.success("ATS analysis complete!");
    } catch (error) {
      console.error("ATS check error:", error);
      toast.error(error.message || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "from-green-500/20 to-green-500/5";
    if (score >= 60) return "from-yellow-500/20 to-yellow-500/5";
    if (score >= 40) return "from-orange-500/20 to-orange-500/5";
    return "from-red-500/20 to-red-500/5";
  };

  const getScoreRingColor = (score) => {
    if (score >= 80) return "border-green-500";
    if (score >= 60) return "border-yellow-500";
    if (score >= 40) return "border-orange-500";
    return "border-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
          <FileSearch className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">ATS Score Checker</h2>
          <p className="text-sm text-zinc-400">
            Check how well your resume matches a job description
          </p>
        </div>
      </div>

      {/* Job Description Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-300">
          Paste Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none resize-none transition-colors"
          placeholder="Paste the job description here to analyze how well your resume matches the requirements..."
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {jobDescription.length} characters (minimum 50)
          </p>
          <Button
            onClick={handleCheckScore}
            disabled={loading || jobDescription.length < 50}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Check ATS Score
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score Card */}
          <div
            className={`p-6 rounded-2xl bg-gradient-to-br ${getScoreBgColor(
              result.score
            )} border border-white/10`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-zinc-300 mb-1">
                  ATS Compatibility Score
                </h3>
                <p className="text-sm text-zinc-400">{result.summary}</p>
              </div>
              <div
                className={`w-24 h-24 rounded-full border-4 ${getScoreRingColor(
                  result.score
                )} flex items-center justify-center bg-black/50`}
              >
                <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </span>
              </div>
            </div>
          </div>

          {/* Section Scores */}
          {result.sectionScores && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(result.sectionScores).map(([section, score]) => (
                <div
                  key={section}
                  className="p-4 rounded-xl bg-zinc-900/50 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400 capitalize">{section}</span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                    <span className="text-zinc-500 text-sm mb-1">/100</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Keywords */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Matched Keywords */}
            {result.keywordMatches?.length > 0 && (
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h4 className="font-medium text-white">Matched Keywords</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywordMatches.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {result.missingKeywords?.length > 0 && (
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <h4 className="font-medium text-white">Missing Keywords</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-300 border border-red-500/30"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Improvement Suggestions</h4>
              </div>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
