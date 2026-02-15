import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { getTelegramUser, useTelegramHaptic } from "@/lib/telegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Quiz, Question } from "@shared/schema";

export default function QuizTake() {
  const [, params] = useRoute("/quiz/:id");
  const [, setLocation] = useLocation();
  const quizId = params?.id;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const telegramUser = getTelegramUser();
  const userId = telegramUser?.id?.toString() || "0";
  const haptic = useTelegramHaptic();
  const { toast } = useToast();

  const { data: quizData, isLoading } = useQuery<Quiz & { questions: Question[] }>({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: !!quizId,
  });

  const saveAttemptMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attemptData),
      });
      if (!response.ok) throw new Error('Failed to save attempt');
      return response.json();
    },
    onSuccess: () => {
      setLocation(`/quiz/${quizId}/results?answers=${selectedAnswers.join(',')}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (quizData?.questions && selectedAnswers.length === 0) {
      setSelectedAnswers(new Array(quizData.questions.length).fill(-1));
    }
  }, [quizData]);

  // Timer countdown effect
  useEffect(() => {
    if (quizData?.timer) {
      setTimeLeft(quizData.timer);
    }
  }, [quizData?.timer, currentQuestionIndex]);

  useEffect(() => {
    if (!quizData?.questions || timeLeft === null || timeLeft <= 0 || isSubmitting) return;

    const isLastQ = currentQuestionIndex === quizData.questions.length - 1;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Time's up - auto advance
          clearInterval(timer);
          if (isLastQ) {
            handleSubmit();
          } else {
            // Mark as unanswered and move to next
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            haptic.impact('medium');
          }
          return 0;
        }
        // Haptic feedback at specific intervals
        if (prev === 10 || prev === 5 || prev <= 3) {
          haptic.impact('light');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, currentQuestionIndex, quizData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
          <p className="text-muted-foreground mb-4">This quiz doesn't exist or has no questions.</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
    haptic.selection();
  };

  const handleNext = () => {
    if (selectedAnswers[currentQuestionIndex] === -1) {
      toast({
        title: "Select an Answer",
        description: "Please select an answer before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      haptic.impact('light');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      haptic.impact('light');
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Calculate results with negative marking
    let correctCount = 0;
    let incorrectCount = 0;
    const answers = quizData.questions.map((q, idx) => {
      const isCorrect = selectedAnswers[idx] === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
      } else if (selectedAnswers[idx] !== -1) {
        incorrectCount++;
      }
      return {
        question_index: idx,
        user_answer: selectedAnswers[idx],
        correct_answer: q.correctAnswer,
        is_correct: isCorrect,
      };
    });

    const totalQuestions = quizData.questions.length;
    const negativeMarking = quizData.negativeMarking || 0;
    const finalScore = correctCount - (incorrectCount * negativeMarking);
    const scorePercentage = (finalScore / totalQuestions) * 100;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000); // in seconds

    // Save attempt
    saveAttemptMutation.mutate({
      userId,
      quizId: quizData.id,
      quizTitle: quizData.title,
      score: finalScore,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      scorePercentage,
      timeTaken,
      answers,
      negativeMarking,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/quizzes")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              {timeLeft !== null && (
                <div className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${
                  timeLeft <= 5 ? 'bg-red-100 dark:bg-red-950/30 text-red-600' :
                  timeLeft <= 10 ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span>{timeLeft}s</span>
                </div>
              )}
              <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1}/{quizData.questions.length}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card className="p-6 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            Question {currentQuestionIndex + 1}
          </h2>
          <p className="text-xl font-semibold leading-relaxed mb-6" style={{ lineHeight: '1.7' }}>
            {currentQuestion.question}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all hover-elevate ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
                data-testid={`option-${index}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 pt-1 leading-relaxed" style={{ lineHeight: '1.6' }}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentQuestionIndex > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
              data-testid="button-previous"
            >
              Previous
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className={`flex-1 ${currentQuestionIndex === 0 ? 'w-full' : ''}`}
            data-testid="button-next"
          >
            {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Submit Quiz' : 'Next Question'}
          </Button>
        </div>

        {/* Question Navigator */}
        <div className="mt-6 p-4 bg-muted/30 rounded-xl">
          <p className="text-xs font-semibold text-muted-foreground mb-3">QUESTION OVERVIEW</p>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {quizData.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all hover-elevate ${
                  idx === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : selectedAnswers[idx] !== -1
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
                data-testid={`nav-question-${idx}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
