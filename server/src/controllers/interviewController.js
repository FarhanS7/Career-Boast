// server/src/controllers/InterviewController.js
import db from "../lib/prisma.js";
import {
  generateImprovementTipAI,
  generateQuizAI,
} from "../services/ai.service.js";

export async function generateQuiz(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
      select: { industry: true, skills: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const questions = await generateQuizAI(user);
    res.json({ questions });
  } catch (err) {
    next(err);
  }
}

export async function saveQuizResult(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { questions, answers, score } = req.body;

    const questionResults = questions.map((q, idx) => ({
      question: q.question,
      answer: q.correctAnswer,
      userAnswer: answers[idx],
      isCorrect: q.correctAnswer === answers[idx],
      explanation: q.explanation,
    }));

    const wrong = questionResults.filter((q) => !q.isCorrect);

    let improvementTip = null;
    if (wrong.length > 0) {
      const wrongText = wrong
        .map(
          (q) =>
            `Question: "${q.question}"\nCorrect: "${q.answer}"\nUser: "${q.userAnswer}"`
        )
        .join("\n\n");

      try {
        improvementTip = await generateImprovementTipAI(
          wrongText,
          user.industry
        );
      } catch (e) {
        console.error("AI tip generation failed", e);
      }
    }

    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    res.json(assessment);
  } catch (err) {
    next(err);
  }
}

export async function listAssessments(req, res, next) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: req.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const rows = await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    res.json(rows);
  } catch (err) {
    next(err);
  }
}
