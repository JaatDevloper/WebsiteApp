import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getTelegramUser } from "@/lib/telegram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import type { Quiz, Question } from "@shared/schema";

interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

export default function QuizEdit() {
  const [match, params] = useRoute("/edit/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const quizId = params?.id || "";
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [timer, setTimer] = useState(30);
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: quizData, isLoading } = useQuery<QuizWithQuestions>({
    queryKey: ['/api/quizzes', quizId],
    enabled: !!quizId,
  });

  useEffect(() => {
    if (quizData) {
      setTitle(quizData.title);
      setDescription(quizData.description || "");
      setIsPaid(quizData.isPaid ?? false);
      setPrice(quizData.price || 0);
      setTimer(quizData.timer || 30);
      setNegativeMarking(quizData.negativeMarking || 0);
      setQuestions(quizData.questions || []);
    }
  }, [quizData]);

  useEffect(() => {
    if (quizData) {
      const changed = 
        title !== quizData.title ||
        description !== (quizData.description || "") ||
        isPaid !== quizData.isPaid ||
        price !== (quizData.price || 0) ||
        timer !== (quizData.timer || 30) ||
        negativeMarking !== (quizData.negativeMarking || 0) ||
        JSON.stringify(questions) !== JSON.stringify(quizData.questions || []);
      setHasChanges(changed);
    }
  }, [title, description, isPaid, price, timer, negativeMarking, questions, quizData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PUT', `/api/quizzes/${quizId}`, {
        title,
        description,
        isPaid,
        price: isPaid ? price : 0,
        timer,
        negativeMarking,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      toast({
        title: "Success",
        description: "Quiz updated successfully",
      });
      setLocation('/quizzes');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quiz",
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    const newQuestion: Partial<Question> = {
      id: `temp-${Date.now()}`,
      quizId,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      order: questions.length,
    };
    setQuestions([...questions, newQuestion as Question]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...updated[questionIndex].options];
    options[optionIndex] = value;
    updated[questionIndex] = { ...updated[questionIndex], options };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Quiz title is required",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate();
  };

  const handleBack = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        setLocation('/quizzes');
      }
    } else {
      setLocation('/quizzes');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex-1">Edit Quiz</h1>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            data-testid="button-save"
            className="gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Quiz Details */}
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quiz description"
              data-testid="input-description"
              className="min-h-24"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPaid">Paid Quiz</Label>
              <p className="text-sm text-muted-foreground">
                Charge users to take this quiz
              </p>
            </div>
            <Switch
              id="isPaid"
              checked={isPaid}
              onCheckedChange={setIsPaid}
              data-testid="switch-is-paid"
            />
          </div>

          {isPaid && (
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                data-testid="input-price"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="timer">Timer (seconds) <span className="text-destructive">*</span></Label>
            <Input
              id="timer"
              type="number"
              min="11"
              value={timer}
              onChange={(e) => setTimer(parseInt(e.target.value) || 30)}
              placeholder="30"
              data-testid="input-timer"
            />
            <p className="text-xs text-muted-foreground">Minimum 11 seconds</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="negativeMarking">Negative Marking</Label>
            <Input
              id="negativeMarking"
              type="number"
              step="0.01"
              min="0"
              value={negativeMarking}
              onChange={(e) => setNegativeMarking(parseFloat(e.target.value) || 0)}
              placeholder="0"
              data-testid="input-negative-marking"
            />
            <p className="text-xs text-muted-foreground">Enter 0 for no negative marking</p>
          </div>
        </Card>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Questions ({questions.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={addQuestion}
              data-testid="button-add-question"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-3">
                <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">No questions yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first question to get started
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={addQuestion}
                  data-testid="button-add-first-question"
                >
                  Add Question
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((question, qIndex) => (
                <Card key={question.id} className="p-5 space-y-4" data-testid={`card-question-${qIndex}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`question-${qIndex}`}>
                        Question {qIndex + 1}
                      </Label>
                      <Textarea
                        id={`question-${qIndex}`}
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder="Enter your question"
                        data-testid={`input-question-${qIndex}`}
                        className="min-h-20"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteQuestion(qIndex)}
                      data-testid={`button-delete-question-${qIndex}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Label>Options</Label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                          data-testid={`radio-correct-${qIndex}-${oIndex}`}
                          className="flex-shrink-0 h-4 w-4"
                        />
                        <Input
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          data-testid={`input-option-${qIndex}-${oIndex}`}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Select the radio button to mark the correct answer
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
              data-testid="button-cancel-changes"
            >
              Discard
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 gap-2"
              data-testid="button-save-changes"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
