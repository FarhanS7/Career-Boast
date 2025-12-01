"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function QuizTaker({ questions, onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answersArray = questions.map((_, idx) => answers[idx] || "");
    const score = questions.reduce((acc, q, idx) => {
      return acc + (q.correctAnswer === answers[idx] ? 10 : 0);
    }, 0);

    onSubmit({
      questions,
      answers: answersArray,
      score
    });
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;
  const allAnswered = answeredCount === questions.length;

  if (showAllQuestions) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Questions</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowAllQuestions(false)}
              >
                Back to Single View
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress: {answeredCount} / {questions.length} answered</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercentage} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, idx) => (
              <Card key={idx} className={answers[idx] ? "border-green-200 bg-green-50/50" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Question {idx + 1}
                    {answers[idx] && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </CardTitle>
                  <p className="text-base font-normal text-gray-900">{q.question}</p>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[idx] || ""}
                    onValueChange={(value) => handleAnswerChange(idx, value)}
                    className="space-y-3"
                  >
                    {q.options.map((option, optionIdx) => (
                      <div
                        key={optionIdx}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <RadioGroupItem value={option} id={`q${idx}-option${optionIdx}`} />
                        <Label
                          htmlFor={`q${idx}-option${optionIdx}`}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                size="lg"
                className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {allAnswered ? "Submit Quiz" : `Answer All Questions (${answeredCount}/${questions.length})`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllQuestions(true)}
            >
              View All Questions
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {answeredCount} / {questions.length} answered</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
            <p className="text-lg font-medium text-gray-900 leading-relaxed">
              {question.question}
            </p>
          </div>

          <RadioGroup
            value={answers[currentQuestion] || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion, value)}
            className="space-y-3"
          >
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === option
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label
                  htmlFor={`option-${idx}`}
                  className="flex-1 cursor-pointer text-base font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center justify-between pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    idx === currentQuestion
                      ? "bg-primary text-primary-foreground shadow-lg scale-110"
                      : answers[idx]
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Submit Quiz
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>💡 Tip: You can navigate between questions and change your answers before submitting.</p>
      </div>
    </div>
  );
}
