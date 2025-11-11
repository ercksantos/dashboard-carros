import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export const MetricCard = ({ title, value, icon: Icon, trend, trendUp }: MetricCardProps) => {
  return (
    <Card className="glass-card shadow-card transition-smooth hover:shadow-glow hover:scale-[1.02] p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="gradient-primary p-3 rounded-xl glow-primary">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    </Card>
  );
};