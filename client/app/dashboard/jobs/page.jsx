"use client";

import JobRecommendations from "@/components/jobs/JobRecommendations";
import ResumeList from "@/components/jobs/ResumeList";
import ResumeUpload from "@/components/jobs/ResumeUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Briefcase, FileText } from "lucide-react";
import { useState } from "react";

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("resumes");
  const [selectedResume, setSelectedResume] = useState(null);

  const handleResumeSelect = (resume) => {
    setSelectedResume(resume);
    setActiveTab("matches");
  };

  const handleBackToResumes = () => {
    setSelectedResume(null);
    setActiveTab("resumes");
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Job Matcher</h1>
        <p className="text-muted-foreground">
          Upload your resume and let our AI find the perfect job opportunities for you.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="resumes" className="gap-2">
            <FileText className="w-4 h-4" />
            My Resumes
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-2" disabled={!selectedResume}>
            <Briefcase className="w-4 h-4" />
            Job Matches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-4 lg:col-span-3">
              <ResumeUpload onUploadSuccess={() => window.location.reload()} />
            </div>
            <div className="md:col-span-8 lg:col-span-9">
              <Card>
                <CardHeader>
                  <CardTitle>Your Resumes</CardTitle>
                  <CardDescription>
                    Select a resume to find matching jobs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResumeList onSelectResume={handleResumeSelect} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          {selectedResume ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border">
                <Button variant="ghost" size="icon" onClick={handleBackToResumes}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h3 className="font-semibold">Matching for: {selectedResume.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedResume.fileName}</p>
                </div>
              </div>
              
              <JobRecommendations resumeId={selectedResume.id} />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Please select a resume first.</p>
              <Button variant="link" onClick={() => setActiveTab("resumes")}>
                Go to Resumes
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
