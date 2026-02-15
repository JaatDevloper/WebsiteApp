import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Save, Rocket, Upload, FileText } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { getTelegramUser, useTelegramHaptic } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [timer, setTimer] = useState("30");
  const [negativeMarking, setNegativeMarking] = useState("0");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [activeTab, setActiveTab] = useState("manual");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const telegramUser = getTelegramUser();
  const userId = telegramUser?.id?.toString() || "0";
  const haptic = useTelegramHaptic();
  const { toast } = useToast();

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: { title: string; description: string; isPaid: boolean; price: number; timer: number; negativeMarking: number; questions: Question[] }) => {
      // First create the quiz
      const quizResponse = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: quizData.title,
          description: quizData.description,
          isPaid: quizData.isPaid,
          price: quizData.price,
          timer: quizData.timer,
          negativeMarking: quizData.negativeMarking,
        }),
      });

      if (!quizResponse.ok) {
        const error = await quizResponse.json();
        throw new Error(error.error || 'Failed to create quiz');
      }

      const quiz = await quizResponse.json();

      // Then create all questions
      for (let i = 0; i < quizData.questions.length; i++) {
        const q = quizData.questions[i];
        const questionResponse = await fetch(`/api/quizzes/${quiz.id}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: i,
          }),
        });

        if (!questionResponse.ok) {
          throw new Error(`Failed to create question ${i + 1}`);
        }
      }

      return { quiz, questionCount: quizData.questions.length };
    },
    onSuccess: (data) => {
      haptic.notification('success');
      toast({
        title: "Quiz Created!",
        description: `Successfully created quiz with ${data.questionCount} questions.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/quizzes?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats?userId=${userId}`] });
      
      // Reset form
      setTitle("");
      setDescription("");
      setIsPaid(false);
      setPrice("");
      setTimer("30");
      setNegativeMarking("0");
      setQuestions([{ id: "1", question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    },
    onError: (error: Error) => {
      haptic.notification('error');
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/quizzes/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      haptic.notification('success');
      toast({
        title: "Quiz Imported!",
        description: `Successfully created quiz with ${data.questionCount} questions.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/quizzes?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats?userId=${userId}`] });
      
      // Reset form
      setTitle("");
      setDescription("");
      setIsPaid(false);
      setPrice("");
      setTimer("30");
      setNegativeMarking("0");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      haptic.notification('error');
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
    haptic.impact('light');
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    haptic.impact('light');
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, i) => (i === optionIndex ? value : opt)) }
          : q
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a quiz title before uploading.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('title', title);
    formData.append('isPaid', isPaid.toString());
    formData.append('price', price || '0');
    formData.append('timer', timer || '30');
    formData.append('negativeMarking', negativeMarking || '0');

    uploadMutation.mutate(formData);
  };

  const handleSave = () => {
    // Validate form
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a quiz title.",
        variant: "destructive",
      });
      return;
    }

    // Validate questions
    const validQuestions = questions.filter(q => 
      q.question.trim() && q.options.every(opt => opt.trim())
    );

    if (validQuestions.length === 0) {
      toast({
        title: "Questions Required",
        description: "Please add at least one complete question with all options.",
        variant: "destructive",
      });
      return;
    }

    // Create quiz
    createQuizMutation.mutate({
      title,
      description,
      isPaid,
      price: isPaid ? parseInt(price) || 0 : 0,
      timer: parseInt(timer) || 30,
      negativeMarking: parseFloat(negativeMarking) || 0,
      questions: validQuestions,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Create Quiz</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Creation Method Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" data-testid="tab-manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload" data-testid="tab-upload">Upload .txt File</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6 mt-6">
            {/* Manual Entry Content */}
            {renderManualEntry()}
          </TabsContent>

          <TabsContent value="upload" className="space-y-6 mt-6">
            {/* File Upload Content */}
            {renderFileUpload()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  function renderManualEntry() {
    return (
      <>
        {/* Basic Info Card */}
        <Card className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-foreground">
              Quiz Title
            </Label>
            <Input
              id="title"
              placeholder="Enter quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-quiz-title"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What is this quiz about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-quiz-description"
              rows={3}
              className="resize-none text-base"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label htmlFor="paid-toggle" className="text-sm font-semibold text-foreground">
                Premium Quiz
              </Label>
              <p className="text-xs text-muted-foreground">Charge for this quiz</p>
            </div>
            <Switch
              id="paid-toggle"
              checked={isPaid}
              onCheckedChange={(checked) => {
                setIsPaid(checked);
                haptic.selection();
              }}
              data-testid="switch-paid"
            />
          </div>

          {isPaid && (
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold text-foreground">
                Price (in coins)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                data-testid="input-quiz-price"
                className="text-base"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="timer" className="text-sm font-semibold text-foreground">
              Timer (seconds) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="timer"
              type="number"
              min="11"
              placeholder="30"
              value={timer}
              onChange={(e) => setTimer(e.target.value)}
              data-testid="input-quiz-timer"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">Minimum 11 seconds</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="negativeMarking" className="text-sm font-semibold text-foreground">
              Negative Marking
            </Label>
            <Input
              id="negativeMarking"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={negativeMarking}
              onChange={(e) => setNegativeMarking(e.target.value)}
              data-testid="input-quiz-negative-marking"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">Enter 0 for no negative marking</p>
          </div>
        </Card>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Questions</h2>
            <Button
              onClick={addQuestion}
              size="sm"
              data-testid="button-add-question"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <Card key={question.id} className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">
                  Question {qIndex + 1}
                </Label>
                {questions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(question.id)}
                    data-testid={`button-remove-question-${qIndex}`}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Input
                placeholder="Enter your question"
                value={question.question}
                onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                data-testid={`input-question-${qIndex}`}
                className="text-base"
              />

              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">
                  ANSWER OPTIONS
                </Label>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3">
                    <Button
                      variant={question.correctAnswer === optIndex ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 rounded-full flex-shrink-0"
                      onClick={() => {
                        updateQuestion(question.id, "correctAnswer", optIndex);
                        haptic.selection();
                      }}
                      data-testid={`button-correct-${qIndex}-${optIndex}`}
                    >
                      {String.fromCharCode(65 + optIndex)}
                    </Button>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                      value={option}
                      onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                      data-testid={`input-option-${qIndex}-${optIndex}`}
                      className="text-base"
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Tap the letter to mark as correct answer
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={createQuizMutation.isPending}
          className="w-full h-12 text-base font-semibold gap-2"
          size="lg"
          data-testid="button-save-quiz"
        >
          <Save className="h-5 w-5" />
          {createQuizMutation.isPending ? 'Saving...' : 'Save Quiz'}
        </Button>
      </>
    );
  }

  function renderFileUpload() {
    return (
      <>
        {/* Basic Info Card */}
        <Card className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="upload-title" className="text-sm font-semibold text-foreground">
              Quiz Title
            </Label>
            <Input
              id="upload-title"
              placeholder="Enter quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-upload-title"
              className="text-base"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label htmlFor="upload-paid-toggle" className="text-sm font-semibold text-foreground">
                Premium Quiz
              </Label>
              <p className="text-xs text-muted-foreground">Charge for this quiz</p>
            </div>
            <Switch
              id="upload-paid-toggle"
              checked={isPaid}
              onCheckedChange={(checked) => {
                setIsPaid(checked);
                haptic.selection();
              }}
              data-testid="switch-upload-paid"
            />
          </div>

          {isPaid && (
            <div className="space-y-2">
              <Label htmlFor="upload-price" className="text-sm font-semibold text-foreground">
                Price (in coins)
              </Label>
              <Input
                id="upload-price"
                type="number"
                placeholder="100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                data-testid="input-upload-price"
                className="text-base"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="upload-timer" className="text-sm font-semibold text-foreground">
              Timer (seconds) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="upload-timer"
              type="number"
              min="11"
              placeholder="30"
              value={timer}
              onChange={(e) => setTimer(e.target.value)}
              data-testid="input-upload-timer"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">Minimum 11 seconds</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-negativeMarking" className="text-sm font-semibold text-foreground">
              Negative Marking
            </Label>
            <Input
              id="upload-negativeMarking"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={negativeMarking}
              onChange={(e) => setNegativeMarking(e.target.value)}
              data-testid="input-upload-negative-marking"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">Enter 0 for no negative marking</p>
          </div>
        </Card>

        {/* File Upload Card */}
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Upload Quiz File
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload a .txt file with questions in the supported format
            </p>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                .txt file (max 5MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="input-file-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending || !title.trim()}
              className="w-full gap-2"
              data-testid="button-select-file"
            >
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? 'Uploading...' : 'Select File'}
            </Button>
          </div>

          {/* Format Guide */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">Supported Formats:</p>
            
            {/* English Format */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">English Format:</p>
              <div className="text-xs text-muted-foreground space-y-1 font-mono">
                <p>1. What is JavaScript?</p>
                <p>A) A programming language *</p>
                <p>B) A database</p>
                <p>C) An operating system</p>
                <p>D) A web browser</p>
              </div>
            </div>

            {/* Hindi Format */}
            <div className="space-y-1 pt-2">
              <p className="text-xs font-semibold text-foreground">Hindi/Devanagari Format:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>महाराणा प्रताप कहा के राजा थे?</p>
                <p>(a) उदयपुर</p>
                <p>(b) चित्तौड़ ✅</p>
                <p>(c) मारवाड़</p>
                <p>(d) बीकानेर</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Mark correct answers with * or ✅ emoji. Question numbers are optional.
            </p>
          </div>
        </Card>
      </>
    );
  }
}
