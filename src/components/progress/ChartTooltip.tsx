interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  unit?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  unit?: string;
}

/** Theme-aware replacement for Recharts' default (white) tooltip. */
export function ChartTooltip({ active, label, payload, unit }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg bg-popover px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10">
      {label != null && <div className="mb-1 font-medium text-popover-foreground">{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
          {entry.color && (
            <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden />
          )}
          <span className="tabular-nums text-popover-foreground">
            {entry.value}
            {unit ? ` ${unit}` : ''}
          </span>
          {entry.name && <span>{entry.name}</span>}
        </div>
      ))}
    </div>
  );
}
