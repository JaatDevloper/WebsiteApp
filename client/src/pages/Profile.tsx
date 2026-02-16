import { getTelegramUser } from "@/lib/telegram";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, Brain, Zap, Award, Star, TrendingUp } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface UserStats {
  totalQuizzes: number;
  freeQuizzes: number;
  paidQuizzes: number;
  engagement: number;
}

interface UserProfile {
  user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  total_quizzes: number;
  total_questions_answered: number;
  total_correct_answers: number;
  total_incorrect_answers: number;
  avg_score_percentage: number;
  achievements: string[];
  streak: {
    current: number;
    best: number;
  };
  is_premium: boolean;
}

export default function Profile() {
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile/default"],
    enabled: false, // Disabling profile for now as we don't have a specific user
  });

  const achievements = [
    { id: 'first_quiz', name: 'First Quiz', icon: Star, earned: (stats?.totalQuizzes || 0) >= 1 },
    { id: 'quiz_master', name: 'Quiz Master', icon: Trophy, earned: (stats?.totalQuizzes || 0) >= 10 },
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/20 shadow-xl">
            <AvatarFallback className="text-3xl font-bold bg-white/20">
              G
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-1">
            Guest User
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-lg">
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {stats?.totalQuizzes || 0}
              </div>
              <div className="text-sm text-muted-foreground">Quizzes Created</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
