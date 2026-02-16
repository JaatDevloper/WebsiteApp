import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getTelegramUser } from "@/lib/telegram";
import { queryClient, apiRequest } from "@/lib/queryClient";
import QuizCard from "@/components/QuizCard";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter } from "lucide-react";
import type { Quiz } from "@shared/schema";

export default function MyQuizzes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const telegramUser = getTelegramUser();
  const userId = telegramUser?.id?.toString() || "7656415064"; // Temporarily hardcoded for your specific account to ensure you see your 478 quizzes
  
  const { data: quizzes, isLoading } = useQuery<(Quiz & { questionCount: number })[]>({
    queryKey: ["/api/quizzes"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (quizId: string) => {
      return apiRequest('DELETE', `/api/quizzes/${quizId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (quiz: Quiz) => {
    setLocation(`/edit/${quiz.id}`);
  };

  const handleDelete = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (quizToDelete) {
      deleteMutation.mutate(quizToDelete.id);
    }
  };

  const filteredQuizzes = quizzes?.filter((quiz) => {
    const title = quiz.title || "Untitled";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "free" && !quiz.isPaid) ||
      (filter === "paid" && quiz.isPaid);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">My Quizzes</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-quizzes"
            className="pl-10 h-11 text-base"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            data-testid="button-filter-all"
            className="flex-shrink-0"
          >
            All ({quizzes?.length || 0})
          </Button>
          <Button
            variant={filter === "free" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("free")}
            data-testid="button-filter-free"
            className="flex-shrink-0"
          >
            Free ({quizzes?.filter((q) => !q.isPaid).length || 0})
          </Button>
          <Button
            variant={filter === "paid" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("paid")}
            data-testid="button-filter-paid"
            className="flex-shrink-0"
          >
            Paid ({quizzes?.filter((q) => q.isPaid).length || 0})
          </Button>
        </div>

        {/* Quiz List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredQuizzes && filteredQuizzes.length > 0 ? (
          <div className="space-y-4">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onEdit={() => handleEdit(quiz)}
                onDelete={() => handleDelete(quiz)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No quizzes found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search"
                : "Create your first quiz to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={quizToDelete?.title || "Quiz"}
        description={`This will permanently delete "${quizToDelete?.title}" and all its questions.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
