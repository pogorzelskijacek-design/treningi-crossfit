import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SessionPoint } from '@/lib/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltip } from './ChartTooltip';

const AXIS_STYLE = { fontSize: 11, fill: 'var(--muted-foreground)' };

export function RpeTrendChart({ data }: { data: SessionPoint[] }) {
  const points = data.filter((d) => d.rpe != null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session RPE trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} minTickGap={20} />
            <YAxis domain={[0, 10]} tick={AXIS_STYLE} tickLine={false} axisLine={false} width={44} />
            <Tooltip content={<ChartTooltip unit="RPE" />} cursor={{ stroke: 'var(--border)' }} />
            <Line
              type="monotone"
              dataKey="rpe"
              name="RPE"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--chart-2)' }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
