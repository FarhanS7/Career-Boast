"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, setAuthToken } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { Award, Calendar, ChevronDown, ChevronUp, Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function AssessmentHistory({ onStartNewQuiz }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      setAuthToken(token);
      
      const data = await api.interview.getAssessments();
      setAssessments(data || []);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError(err.message || "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100 border-green-300";
    if (score >= 60) return "text-yellow-600 bg-yellow-100 border-yellow-300";
    return "text-red-600 bg-red-100 border-red-300";
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return { label: "Excellent", icon: "🏆" };
    if (score >= 80) return { label: "Great", icon: "🌟" };
    if (score >= 70) return { label: "Good", icon: "👍" };
    if (score >= 60) return { label: "Fair", icon: "📈" };
    return { label: "Needs Work", icon: "💪" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAssessments} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Award className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">No Assessments Yet</h3>
            <p className="text-muted-foreground mb-6">
              Take your first quiz to see your results here!
            </p>
            <Button onClick={onStartNewQuiz} className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Start Your First Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageScore = (assessments.reduce((sum, a) => sum + a.quizScore, 0) / assessments.length).toFixed(1);
  const highestScore = Math.max(...assessments.map(a => a.quizScore));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-700">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-700">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{averageScore}%</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-700">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{highestScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assessment History</CardTitle>
          <Button onClick={onStartNewQuiz} size="sm" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            New Quiz
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessments.map((assessment) => {
            const isExpanded = expandedId === assessment.id;
            const badge = getScoreBadge(assessment.quizScore);
            const correctCount = assessment.questions.filter(q => q.isCorrect).length;

            return (
              <Card key={assessment.id} className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpanded(assessment.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`px-4 py-2 rounded-lg border-2 font-bold text-2xl ${getScoreColor(assessment.quizScore)}`}>
                        {assessment.quizScore}%
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-semibold">{badge.icon} {badge.label}</span>
                          <span className="text-sm text-muted-foreground">
                            • {correctCount}/{assessment.questions.length} correct
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(assessment.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {assessment.improvementTip && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm font-semibold text-purple-900 mb-1">💡 Improvement Tip</p>
                          <p className="text-sm text-purple-800">{assessment.improvementTip}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Question Breakdown:</p>
                        {assessment.questions.map((q, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded text-sm ${
                              q.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                            }`}
                          >
                            <p className="font-medium mb-1">
                              {idx + 1}. {q.question}
                            </p>
                            <p className={q.isCorrect ? "text-green-700" : "text-red-700"}>
                              Your answer: {q.userAnswer}
                              {!q.isCorrect && ` • Correct: ${q.answer}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
