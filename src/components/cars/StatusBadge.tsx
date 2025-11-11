import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'disponível':
        return 'bg-success/20 text-success border-success/30';
      case 'vendido':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'revisão':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor()} transition-smooth`}>
      {status}
    </Badge>
  );
};