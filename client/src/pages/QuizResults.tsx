import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { getTelegramUser } from "@/lib/telegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle, XCircle, Home, RotateCcw, Award } from "lucide-react";
import type { Quiz, Question } from "@shared/schema";

export default function QuizResults() {
  const [, params] = useRoute("/quiz/:id/results");
  const [, setLocation] = useLocation();
  const quizId = params?.id;
  const telegramUser = getTelegramUser();
  const userId = telegramUser?.id?.toString() || "0";
  
  // Get answers from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const answersStr = searchParams.get('answers');
  const selectedAnswers = answersStr ? answersStr.split(',').map(Number) : [];

  const { data: quizData } = useQuery<Quiz & { questions: Question[] }>({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: !!quizId,
  });

  const { data: leaderboard } = useQuery({
    queryKey: [`/api/quiz-attempts?quizId=${quizId}`],
    enabled: !!quizId,
  });

  if (!quizData || !quizData.questions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate results with negative marking
  const totalQuestions = quizData.questions.length;
  const correctAnswers = quizData.questions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length;
  const incorrectAnswers = quizData.questions.filter((q, idx) => selectedAnswers[idx] !== -1 && selectedAnswers[idx] !== q.correctAnswer).length;
  const unanswered = totalQuestions - correctAnswers - incorrectAnswers;
  const negativeMarking = quizData.negativeMarking || 0;
  const finalScore = correctAnswers - (incorrectAnswers * negativeMarking);
  const scorePercentage = (finalScore / totalQuestions) * 100;

  const getPerformanceMessage = () => {
    if (scorePercentage >= 90) return { text: "Outstanding! 🎉", color: "text-green-600" };
    if (scorePercentage >= 70) return { text: "Great Job! 👏", color: "text-blue-600" };
    if (scorePercentage >= 50) return { text: "Good Effort! 👍", color: "text-yellow-600" };
    return { text: "Keep Practicing! 💪", color: "text-orange-600" };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-full mb-4">
            <Trophy className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-primary-foreground/90">{quizData.title}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8">
        {/* Score Card */}
        <Card className="p-6 mb-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-primary mb-2">
              {finalScore.toFixed(2)}/{totalQuestions}
            </div>
            <p className={`text-2xl font-semibold ${performance.color}`}>
              {performance.text}
            </p>
            <p className="text-muted-foreground mt-2">{scorePercentage.toFixed(1)}%</p>
          </div>

          <Progress value={Math.max(0, scorePercentage)} className="h-3 mb-6" />

          {/* Score Breakdown */}
          <div className="bg-muted/30 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-3">SCORE BREAKDOWN</p>
            <div className="flex justify-between items-center">
              <span className="text-sm">Correct Answers:</span>
              <span className="text-sm font-semibold text-green-600">{correctAnswers} × 1 = +{correctAnswers}</span>
            </div>
            {negativeMarking > 0 && incorrectAnswers > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Incorrect Answers:</span>
                <span className="text-sm font-semibold text-red-600">{incorrectAnswers} × -{negativeMarking} = -{(incorrectAnswers * negativeMarking).toFixed(2)}</span>
              </div>
            )}
            {unanswered > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Unanswered:</span>
                <span className="text-sm font-semibold text-muted-foreground">{unanswered} × 0 = 0</span>
              </div>
            )}
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Final Score:</span>
                <span className="text-sm font-bold text-primary">{finalScore.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setLocation(`/quiz/${quizId}`)}
              variant="outline"
              className="flex-1 gap-2"
              data-testid="button-retake"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
            <Button
              onClick={() => setLocation("/")}
              className="flex-1 gap-2"
              data-testid="button-home"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </Card>

        {/* Answer Review */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Answer Review
          </h2>
          <div className="space-y-4">
            {quizData.questions.map((question, idx) => {
              const userAnswer = selectedAnswers[idx];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 ${
                    isCorrect ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/10' : 'border-red-500/30 bg-red-50/50 dark:bg-red-950/10'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-muted-foreground mb-1">
                        Question {idx + 1}
                      </p>
                      <p className="font-medium leading-relaxed" style={{ lineHeight: '1.7' }}>
                        {question.question}
                      </p>
                    </div>
                  </div>

                  <div className="ml-8 space-y-2">
                    {!isCorrect && userAnswer !== -1 && (
                      <div className="flex items-start gap-2">
                        <Badge variant="destructive" className="flex-shrink-0">Your Answer</Badge>
                        <span className="text-sm">{question.options[userAnswer]}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Badge className="bg-green-600 flex-shrink-0">Correct Answer ✅</Badge>
                      <span className="text-sm font-medium">{question.options[question.correctAnswer]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Leaderboard */}
        {leaderboard && Array.isArray(leaderboard) && leaderboard.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboard
            </h2>
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry: any, idx: number) => {
                const isCurrentUser = entry.user_id?.toString() === userId;
                const rank = idx + 1;
                const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCurrentUser ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl font-bold w-12 text-center">{rankBadge}</div>
                      <div>
                        <div className="font-semibold">
                          User {entry.user_id} {isCurrentUser && <Badge className="ml-2">You</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.time_taken ? `${Math.floor(entry.time_taken / 60)}m ${entry.time_taken % 60}s` : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{entry.score}/{entry.total_questions}</div>
                      <div className="text-xs text-muted-foreground">{entry.score_percentage?.toFixed(0)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
