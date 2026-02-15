import { Layers, Unlock, Lock, Users, Play, Share2, BarChart3, Rocket, PlusCircle } from "lucide-react";
import StatCard from "@/components/StatCard";
import QuickActionButton from "@/components/QuickActionButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { getTelegramUser } from "@/lib/telegram";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface StatsData {
  totalQuizzes: number;
  freeQuizzes: number;
  paidQuizzes: number;
  engagement: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const telegramUser = getTelegramUser();
  const userId = telegramUser?.id?.toString() || "7656415064"; // Hardcoded fallback for your account
  
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: [`/api/stats?userId=${userId}`],
    enabled: !!userId,
  });

  const userName = telegramUser?.first_name || "User";

  const handleStartLiveQuiz = () => {
    setLocation("/quizzes");
    toast({
      title: "Live Quiz Feature",
      description: "Select a quiz from your collection to share with participants in real-time!",
    });
  };

  return (
    <div className="pb-8">
      {/* Top Header */}
      <div className="px-4 py-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-2 rounded-xl shadow-lg">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-base font-semibold text-foreground">Premium Quiz Bot</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="bg-gradient-to-br from-purple-600 to-blue-500 w-9 h-9 rounded-full flex items-center justify-center shadow-lg font-bold text-sm text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="mx-4 my-5">
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 text-white px-5 py-6 rounded-3xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Rocket className="h-7 w-7" />
              Welcome Back!
            </h2>
            <p className="text-white/95 text-sm leading-relaxed">
              Create, manage, and track your quizzes all in one place
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-5 -mt-8 mb-6">
        <div className="grid grid-cols-2 gap-3.5">
          {isLoading ? (
            <>
              <div className="h-32 bg-card rounded-xl animate-pulse" />
              <div className="h-32 bg-card rounded-xl animate-pulse" />
              <div className="h-32 bg-card rounded-xl animate-pulse" />
              <div className="h-32 bg-card rounded-xl animate-pulse" />
            </>
          ) : (
            <>
              <StatCard
                title="Total Quizzes"
                value={stats?.totalQuizzes || 0}
                icon={Layers}
                iconColor="bg-chart-1"
              />
              <StatCard
                title="Free Quizzes"
                value={stats?.freeQuizzes || 0}
                icon={Unlock}
                iconColor="bg-chart-3"
              />
              <StatCard
                title="Paid Quizzes"
                value={stats?.paidQuizzes || 0}
                icon={Lock}
                iconColor="bg-chart-4"
              />
              <StatCard
                title="Engagement"
                value={stats?.engagement || 0}
                icon={Users}
                iconColor="bg-chart-2"
              />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg font-bold text-foreground">Quick Actions</div>
        </div>
        <div className="space-y-3">
          <QuickActionButton
            title="Create New Quiz"
            icon={PlusCircle}
            onClick={() => setLocation("/create")}
          />
          <QuickActionButton
            title="Share Your Quizzes"
            icon={Share2}
            onClick={() => setLocation("/quizzes")}
          />
          <QuickActionButton
            title="View Analytics"
            icon={BarChart3}
            onClick={() => setLocation("/profile")}
          />
          <QuickActionButton
            title="Start Live Quiz"
            icon={Play}
            onClick={handleStartLiveQuiz}
          />
        </div>
      </div>
    </div>
  );
}
