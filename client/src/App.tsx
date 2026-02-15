import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initTelegramApp, getTelegramUser } from "@/lib/telegram";
import Dashboard from "@/pages/Dashboard";
import Create from "@/pages/Create";
import MyQuizzes from "@/pages/MyQuizzes";
import QuizEdit from "@/pages/QuizEdit";
import Profile from "@/pages/Profile";
import QuizTake from "@/pages/QuizTake";
import QuizResults from "@/pages/QuizResults";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        {/* Quiz taking and editing routes - without navigation */}
        <Route path="/quiz/:id" component={QuizTake} />
        <Route path="/quiz/:id/results" component={QuizResults} />
        <Route path="/edit/:id" component={QuizEdit} />
        
        {/* Regular pages - with navigation */}
        <Route path="/">
          {() => (
            <>
              <Navigation />
              <Dashboard />
            </>
          )}
        </Route>
        <Route path="/create">
          {() => (
            <>
              <Navigation />
              <Create />
            </>
          )}
        </Route>
        <Route path="/quizzes">
          {() => (
            <>
              <Navigation />
              <MyQuizzes />
            </>
          )}
        </Route>
        <Route path="/profile">
          {() => (
            <>
              <Navigation />
              <Profile />
            </>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  useEffect(() => {
    initTelegramApp();

    // Automatically sync Telegram user when app starts
    const telegramUser = getTelegramUser();
    const userId = telegramUser?.id?.toString() || "7656415064";
    
    if (userId) {
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: userId,
          username: telegramUser?.username || "testuser",
          firstName: telegramUser?.first_name || "Test",
          lastName: telegramUser?.last_name || "User",
        }),
      })
      .catch((error) => console.error("Failed to sync user:", error));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
