"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, setAuthToken } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export default function QuizGenerator({ onQuizGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      setAuthToken(token);
      
      const response = await api.interview.generateQuiz();
      
      if (response.questions && response.questions.length > 0) {
        onQuizGenerated(response.questions);
      } else {
        setError("Failed to generate quiz questions. Please try again.");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err.message || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Technical Interview Prep</CardTitle>
          <CardDescription className="text-lg">
            Test your knowledge with AI-generated questions tailored to your industry and skills.
            Get instant feedback and personalized improvement tips.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">AI-Powered</h3>
              </div>
              <p className="text-sm text-blue-700">
                Questions generated based on your profile
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">10 Questions</h3>
              </div>
              <p className="text-sm text-green-700">
                Comprehensive technical assessment
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Smart Tips</h3>
              </div>
              <p className="text-sm text-purple-700">
                Get personalized improvement advice
              </p>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleGenerateQuiz}
              disabled={loading}
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Start Assessment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>💡 Tip: Take your time and read each question carefully. You can review your answers at the end.</p>
      </div>
    </div>
  );
}
