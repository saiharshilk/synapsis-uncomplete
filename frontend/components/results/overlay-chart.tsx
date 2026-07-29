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
import { COMPOSITE_COLOR, type Variant } from '@/lib/mock-data'

const NEUTRAL_STROKES = ['#141412', '#6f6d66', '#9c9a91']

const monoTick = {
  fontSize: 10,
  fontFamily: 'var(--font-mono)',
  fill: 'var(--muted-foreground)',
}

export function OverlayChart({ variants, winnerId }: { variants: Variant[]; winnerId: string }) {
  // Merge composite curves onto a shared time axis
  const merged = variants[0].curve.map((point, i) => {
    const row: Record<string, number> = { t: point.t }
    for (const variant of variants) {
      row[variant.id] = variant.curve[i]?.composite ?? 0
    }
    return row
  })

  let neutralIndex = 0

  return (
    <div className="h-64 w-full md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
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
          {variants.map((variant) => {
            const isWinner = variant.id === winnerId
            const stroke = isWinner
              ? COMPOSITE_COLOR
              : NEUTRAL_STROKES[neutralIndex++ % NEUTRAL_STROKES.length]
            return (
              <Line
                key={variant.id}
                type="monotone"
                dataKey={variant.id}
                name={`Variant ${variant.label}${isWinner ? ' (winner)' : ''}`}
                stroke={stroke}
                strokeWidth={isWinner ? 2.5 : 1.25}
                dot={false}
                isAnimationActive={false}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
