import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

export function StatTile({ icon: Icon, label, value, hint }: StatTileProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </Card>
  );
}
