import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToggleChipProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

export function ToggleChip({ label, active, onToggle }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {active && <Check className="size-3.5" />}
      {label}
    </button>
  );
}
