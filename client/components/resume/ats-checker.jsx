"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, setAuthToken } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import {
    AlertCircle,
    CheckCircle2,
    CloudUpload,
    FileSearch,
    FileText,
    Loader2,
    Sparkles,
    Target,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function ATSChecker() {
  const { getToken } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleCheckScore = async () => {
    if (jobDescription.length < 50) {
      toast.error("Job description must be at least 50 characters");
      return;
    }

    if (activeTab === "upload" && !selectedFile) {
      toast.error("Please upload a resume file");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      let data;
      
      if (activeTab === "upload") {
        const formData = new FormData();
        formData.append("resume", selectedFile);
        formData.append("jobDescription", jobDescription);
        data = await api.resume.checkATSScoreFile(formData);
      } else {
        data = await api.resume.checkATSScore(jobDescription);
      }

      setResult(data);
      toast.success("ATS analysis complete!");
    } catch (error) {
      console.error("ATS check error:", error);
      toast.error(error.message || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "text/plain") {
        setSelectedFile(file);
      } else {
        toast.error("Please upload a PDF or TXT file");
      }
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

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Inputs */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="existing" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-white/10">
              <TabsTrigger value="existing">Stored Resume</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Current Information</h3>
                  <p className="text-sm text-zinc-400">Using resume info from your profile</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-6 space-y-4">
              <div 
                className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full bg-green-500/10 text-green-400 mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-white mb-1">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full bg-zinc-800 text-zinc-400 mb-3">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-white mb-1">Click to upload resume</p>
                    <p className="text-xs text-zinc-500">Supports PDF and TXT files</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-300">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none resize-none transition-colors"
              placeholder="Paste the job description here..."
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                {jobDescription.length} characters (min 50)
              </p>
              <Button
                onClick={handleCheckScore}
                disabled={loading || jobDescription.length < 50 || (activeTab === "upload" && !selectedFile)}
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
                    Check Compatibility
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="md:col-span-1">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 sticky top-6">
              {/* Score Card */}
              <div
                className={`p-6 rounded-2xl bg-gradient-to-br ${getScoreBgColor(
                  result.score
                )} border border-white/10 text-center`}
              >
                <div
                  className={`w-32 h-32 mx-auto rounded-full border-8 ${getScoreRingColor(
                    result.score
                  )} flex items-center justify-center bg-black/50 mb-4`}
                >
                  <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  ATS Match Score
                </h3>
                <p className="text-sm text-zinc-400">{result.summary}</p>
              </div>

              {/* Section Scores */}
              {result.sectionScores && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Breakdown</h4>
                  {Object.entries(result.sectionScores).map(([section, score]) => (
                    <div key={section} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/10">
                      <span className="text-sm text-zinc-300 capitalize">{section}</span>
                      <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-white/5 rounded-2xl bg-white/5 md:min-h-[400px]">
              <div className="p-4 rounded-full bg-zinc-900 text-zinc-500 mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-white font-medium mb-2">Ready to Analyze</h3>
              <p className="text-sm text-zinc-500">
                Upload your resume and paste a job description to get a detailed ATS compatibility report
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Results (Keywords & Suggestions) */}
      {result && (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="space-y-6">
             {/* Keywords */}
             <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Keyword Analysis</h3>
                
                <div className="space-y-4">
                  {result.keywordMatches?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Matched Keywords</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.keywordMatches.map((keyword, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.missingKeywords?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Missing Keywords</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.missingKeywords.map((keyword, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>

          <div className="space-y-6">
            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Improvement Plan</h3>
                </div>
                <ul className="space-y-3">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300 p-3 rounded-lg bg-black/20">
                      <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
