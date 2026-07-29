'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { COMPOSITE_COLOR, NETWORKS, type EngagementPoint } from '@/lib/mock-data'

const monoTick = {
  fontSize: 10,
  fontFamily: 'var(--font-mono)',
  fill: 'var(--muted-foreground)',
}

export function EngagementChart({ curve }: { curve: EngagementPoint[] }) {
  return (
    <div className="h-72 w-full md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={curve} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="var(--border)" strokeWidth={0.5} />
          <XAxis
            dataKey="t"
            tick={monoTick}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            tickFormatter={(v: number) => `${v}s`}
          />
          <YAxis
            domain={[0, 1]}
            tick={monoTick}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 2,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
            labelFormatter={(v) => `t = ${v}s`}
            formatter={(value) => (typeof value === 'number' ? value.toFixed(3) : value)}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase' }}
            iconType="plainline"
          />
          {NETWORKS.map((network) => (
            <Line
              key={network.key}
              type="monotone"
              dataKey={network.key}
              name={network.label}
              stroke={network.color}
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          <Line
            type="monotone"
            dataKey="composite"
            name="Composite"
            stroke={COMPOSITE_COLOR}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
