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
  const user = getTelegramUser();
  const userId = user?.id?.toString() || "0";

  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/stats?userId=${userId}`],
    enabled: !!userId && userId !== "0",
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: [`/api/user-profile/${userId}`],
    enabled: !!userId && userId !== "0",
  });

  // Get Telegram profile photo URL
  const getProfilePhotoUrl = () => {
    if (user?.photo_url) {
      return user.photo_url;
    }
    return null;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-semibold mb-2">No Telegram User Found</h2>
        <p className="text-muted-foreground mb-4">
          Please open this Mini App inside Telegram to view your profile.
        </p>
      </div>
    );
  }

  const achievements = [
    { id: 'first_quiz', name: 'First Quiz', icon: Star, earned: (stats?.totalQuizzes || 0) >= 1 },
    { id: 'quiz_master', name: 'Quiz Master', icon: Trophy, earned: (stats?.totalQuizzes || 0) >= 10 },
    { id: 'high_scorer', name: 'High Scorer', icon: Target, earned: (profile?.avg_score_percentage || 0) >= 80 },
    { id: 'brain_power', name: 'Brain Power', icon: Brain, earned: (profile?.total_questions_answered || 0) >= 100 },
    { id: 'streak_master', name: 'Streak Master', icon: Zap, earned: (profile?.streak?.best || 0) >= 7 },
    { id: 'perfectionist', name: 'Perfectionist', icon: Award, earned: (profile?.avg_score_percentage || 0) >= 95 },
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
          <ThemeToggle />
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/20 shadow-xl">
            <AvatarImage src={getProfilePhotoUrl() || undefined} alt={user.first_name || "User"} />
            <AvatarFallback className="text-3xl font-bold bg-white/20">
              {user.first_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-1">
            {user.first_name} {user.last_name || ""}
          </h1>
          {user.username && (
            <p className="text-sm text-primary-foreground/80 mb-3">@{user.username}</p>
          )}
          {profile?.is_premium && (
            <Badge className="bg-yellow-500 text-yellow-950 border-yellow-400">
              ⭐ Premium Member
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-lg">
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {stats?.totalQuizzes || 0}
              </div>
              <div className="text-sm text-muted-foreground">Quizzes Created</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {profile?.total_quizzes || 0}
              </div>
              <div className="text-sm text-muted-foreground">Quizzes Taken</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {profile?.avg_score_percentage?.toFixed(0) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {profile?.streak?.current || 0}🔥
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Stats */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Questions</span>
              <span className="font-semibold">{profile?.total_questions_answered || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Correct Answers</span>
              <span className="font-semibold text-green-600">{profile?.total_correct_answers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Incorrect Answers</span>
              <span className="font-semibold text-red-600">{profile?.total_incorrect_answers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Best Streak</span>
              <span className="font-semibold">{profile?.streak?.best || 0} days</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5" />
              Achievements ({earnedAchievements.length}/{achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-xl text-center transition-all ${
                      achievement.earned
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50 opacity-50 grayscale'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${
                      achievement.earned ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <p className="text-xs font-medium leading-tight">
                      {achievement.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telegram ID</span>
              <span className="font-semibold">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language</span>
              <span className="font-semibold">
                {user.language_code?.toUpperCase() || "EN"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.Telegram?.WebApp.close()}
          >
            Close Mini App
          </Button>
        </div>
      </div>
    </div>
  );
}
