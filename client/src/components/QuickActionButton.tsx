import { Button } from "@/components/ui/button";
import { ChevronRight, LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  title: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export default function QuickActionButton({ title, icon: Icon, onClick }: QuickActionButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full justify-between h-auto py-4 px-5 rounded-2xl shadow-sm"
      onClick={onClick}
      data-testid={`button-action-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-3.5">
        <div className="bg-primary/10 p-2 rounded-xl">
          <Icon className="h-5 w-5 text-primary" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-base">{title}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Button>
  );
}
