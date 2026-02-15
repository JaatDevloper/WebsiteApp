import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, FileQuestion, Play } from "lucide-react";
import { useLocation } from "wouter";
import type { Quiz } from "@shared/schema";

interface QuizCardProps {
  quiz: Quiz & { questionCount?: number };
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean; // Whether to show edit/delete buttons (for My Quizzes page)
}

export default function QuizCard({ quiz, onEdit, onDelete, showActions = true }: QuizCardProps) {
  const [, setLocation] = useLocation();

  const handleTakeQuiz = () => {
    setLocation(`/quiz/${quiz.id}`);
  };

  return (
    <Card className="p-5 space-y-4 hover-elevate" data-testid={`card-quiz-${quiz.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-foreground mb-1 truncate" data-testid={`text-quiz-title-${quiz.id}`}>
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {quiz.description}
            </p>
          )}
        </div>
        <Badge variant={quiz.isPaid ? "default" : "secondary"} className="flex-shrink-0">
          {quiz.isPaid ? `$${quiz.price}` : "Free"}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileQuestion className="h-4 w-4" />
          <span>{quiz.questionCount || 0} questions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{quiz.participants} participants</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        {showActions ? (
          <>
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-2"
              onClick={handleTakeQuiz}
              data-testid={`button-take-quiz-${quiz.id}`}
            >
              <Play className="h-4 w-4" />
              Take Quiz
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              data-testid={`button-edit-quiz-${quiz.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              data-testid={`button-delete-quiz-${quiz.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full gap-2"
            onClick={handleTakeQuiz}
            data-testid={`button-take-quiz-${quiz.id}`}
          >
            <Play className="h-4 w-4" />
            Start Quiz
          </Button>
        )}
      </div>
    </Card>
  );
}
