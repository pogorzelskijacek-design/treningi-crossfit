import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechniqueRatingProps {
  value?: number;
  onChange: (value: number) => void;
}

export function TechniqueRating({ value, onChange }: TechniqueRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Technique ${n} of 5`}
          onClick={() => onChange(n)}
          className="p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Star
            className={cn('size-5', value != null && n <= value && 'fill-primary text-primary')}
          />
        </button>
      ))}
    </div>
  );
}
