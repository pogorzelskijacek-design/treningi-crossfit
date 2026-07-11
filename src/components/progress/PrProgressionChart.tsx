import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PersonalRecord } from '@/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltip } from './ChartTooltip';
import { prProgression } from '@/lib/stats';
import { cn } from '@/lib/utils';

const AXIS_STYLE = { fontSize: 11, fill: 'var(--muted-foreground)' };

export function PrProgressionChart({ records }: { records: PersonalRecord[] }) {
  const liftTypes = useMemo(() => {
    const byType = new Map<string, string>();
    for (const pr of records) {
      if (pr.valueKg != null) byType.set(pr.type, pr.label);
    }
    return [...byType.entries()].map(([type, label]) => ({ type, label }));
  }, [records]);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const activeType = selectedType ?? liftTypes[0]?.type ?? null;

  const data = useMemo(
    () => (activeType ? prProgression(records, activeType) : []),
    [records, activeType]
  );

  if (liftTypes.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>PR progression</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {liftTypes.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                type === activeType
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} minTickGap={20} />
            <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={44} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip content={<ChartTooltip unit="kg" />} cursor={{ stroke: 'var(--border)' }} />
            <Line
              type="monotone"
              dataKey="valueKg"
              name="1RM"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--chart-3)' }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
