import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

export function SliderField({
  id,
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel,
  highLabel,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm font-medium tabular-nums text-muted-foreground">{value}/{max}</span>
      </div>
      <Slider
        id={id}
        value={[value]}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
        min={min}
        max={max}
        step={1}
      />
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  );
}
