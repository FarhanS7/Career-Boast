"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, History, RotateCcw, TrendingUp, XCircle } from "lucide-react";

export default function QuizResults({ assessment, onRetake, onViewHistory }) {
  if (!assessment) return null;

  const { quizScore, questions, improvementTip } = assessment;
  
  const correctCount = questions.filter(q => q.isCorrect).length;
  const incorrectCount = questions.length - correctCount;
  const percentage = quizScore;

  const getScoreColor = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Excellent! 🎉";
    if (score >= 80) return "Great job! 🌟";
    if (score >= 70) return "Good work! 👍";
    if (score >= 60) return "Not bad! 📈";
    return "Keep practicing! 💪";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score Summary Card */}
      <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${getScoreColor(percentage)}`} />
        <CardHeader className="text-center space-y-4 pb-2">
          <CardTitle className="text-2xl">Assessment Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(percentage)} flex items-center justify-center shadow-xl`}>
                <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{percentage}%</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mt-4">{getScoreMessage(percentage)}</h3>
            <p className="text-muted-foreground">
              You answered {correctCount} out of {questions.length} questions correctly
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">{correctCount}</div>
                  <div className="text-sm text-green-700">Correct Answers</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-full">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-900">{incorrectCount}</div>
                  <div className="text-sm text-red-700">Incorrect Answers</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={onRetake}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Take Another Quiz
            </Button>
            <Button
              onClick={onViewHistory}
              variant="outline"
              className="gap-2"
            >
              <History className="w-4 h-4" />
              View History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Improvement Tip */}
      {improvementTip && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <TrendingUp className="w-5 h-5" />
              Personalized Improvement Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-800 leading-relaxed">{improvementTip}</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                q.isCorrect
                  ? "border-green-200 bg-green-50/50"
                  : "border-red-200 bg-red-50/50"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-1 rounded-full ${
                  q.isCorrect ? "bg-green-500" : "bg-red-500"
                }`}>
                  {q.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <XCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Question {idx + 1}</h4>
                  <p className="text-foreground mb-3">{q.question}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Your answer:</span>
                      <span className={q.isCorrect ? "text-green-700" : "text-red-700"}>
                        {q.userAnswer || "Not answered"}
                      </span>
                    </div>
                    {!q.isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Correct answer:</span>
                        <span className="text-green-700">{q.answer}</span>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 p-3 bg-background/80 rounded border">
                      <p className="text-sm">
                        <span className="font-semibold">Explanation: </span>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
