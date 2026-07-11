import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SessionPoint } from '@/lib/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltip } from './ChartTooltip';

const AXIS_STYLE = { fontSize: 11, fill: 'var(--muted-foreground)' };

export function VolumeChart({ data }: { data: SessionPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training volume per session</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} minTickGap={20} />
            <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={44} />
            <Tooltip content={<ChartTooltip unit="kg" />} cursor={{ stroke: 'var(--border)' }} />
            <Area
              type="monotone"
              dataKey="volumeKg"
              name="volume"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#volumeFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
