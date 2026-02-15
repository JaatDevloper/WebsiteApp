import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
}

export default function StatCard({ title, value, icon: Icon, iconColor }: StatCardProps) {
  return (
    <Card className="p-5 flex flex-col items-center justify-center gap-3.5 shadow-sm" data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`${iconColor} p-3 rounded-2xl shadow-md`}>
        <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-foreground tracking-tight" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        <div className="text-sm text-muted-foreground mt-1.5 font-medium">
          {title}
        </div>
      </div>
    </Card>
  );
}
