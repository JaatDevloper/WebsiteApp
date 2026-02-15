import { Home, PlusCircle, FileText, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTelegramHaptic } from "@/lib/telegram";

export default function Navigation() {
  const [location] = useLocation();
  const haptic = useTelegramHaptic();

  const tabs = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Create", path: "/create", icon: PlusCircle },
    { name: "My Quizzes", path: "/quizzes", icon: FileText },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const handleTabClick = () => {
    haptic.selection();
  };

  return (
    <nav className="px-4 py-3 bg-background border-t border-border/40 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;

          return (
            <Link key={tab.path} href={tab.path}>
              <button
                onClick={handleTabClick}
                data-testid={`button-nav-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30 scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" strokeWidth={2.3} />
                <span className="text-xs font-semibold">{tab.name}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
