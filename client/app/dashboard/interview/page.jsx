"use client";

import AssessmentHistory from "@/components/interview/AssessmentHistory";
import QuizGenerator from "@/components/interview/QuizGenerator";
import QuizResults from "@/components/interview/QuizResults";
import QuizTaker from "@/components/interview/QuizTaker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, setAuthToken } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { Brain, History } from "lucide-react";
import { useState } from "react";

export default function InterviewPage() {
  const [activeTab, setActiveTab] = useState("quiz");
  const [quizState, setQuizState] = useState("not-started"); // not-started, taking, completed
  const [currentQuestions, setCurrentQuestions] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { getToken } = useAuth();

  const handleQuizGenerated = (questions) => {
    setCurrentQuestions(questions);
    setQuizState("taking");
  };

  const handleQuizSubmit = async (quizData) => {
    try {
      setSubmitting(true);
      
      const token = await getToken();
      setAuthToken(token);
      
      const assessment = await api.interview.submitQuiz(quizData);
      
      setCurrentAssessment(assessment);
      setQuizState("completed");
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert(err.message || "Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setQuizState("not-started");
    setCurrentQuestions(null);
    setCurrentAssessment(null);
  };

  const handleViewHistory = () => {
    setActiveTab("history");
    setQuizState("not-started");
    setCurrentQuestions(null);
    setCurrentAssessment(null);
  };

  const handleStartNewQuiz = () => {
    setActiveTab("quiz");
    setQuizState("not-started");
    setCurrentQuestions(null);
    setCurrentAssessment(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Interview Preparation
        </h1>
        <p className="text-muted-foreground text-lg">
          Sharpen your technical skills with AI-powered assessments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="quiz" className="gap-2">
            <Brain className="w-4 h-4" />
            Take Quiz
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz" className="space-y-6">
          {quizState === "not-started" && (
            <QuizGenerator onQuizGenerated={handleQuizGenerated} />
          )}

          {quizState === "taking" && currentQuestions && (
            <QuizTaker
              questions={currentQuestions}
              onSubmit={handleQuizSubmit}
            />
          )}

          {quizState === "completed" && currentAssessment && (
            <QuizResults
              assessment={currentAssessment}
              onRetake={handleRetake}
              onViewHistory={handleViewHistory}
            />
          )}

          {submitting && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card p-8 rounded-lg shadow-xl border-2 flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-lg font-semibold">Submitting your quiz...</p>
                <p className="text-sm text-muted-foreground">Generating your personalized feedback</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <AssessmentHistory onStartNewQuiz={handleStartNewQuiz} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
