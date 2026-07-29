'use client'

import { useState } from 'react'
import { Sparkles, Trophy } from 'lucide-react'
import { EngagementChart } from '@/components/results/engagement-chart'
import { OverlayChart } from '@/components/results/overlay-chart'
import { WaveformIcon } from '@/components/waveform-icon'
import { formatTimestamp, type TestResult } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function ResultsView({ test }: { test: TestResult }) {
  const [activeId, setActiveId] = useState(test.variants[0].id)
  const [suggesting, setSuggesting] = useState(false)

  const winner = test.variants.find((v) => v.id === test.winnerId) ?? test.variants[0]
  const runnerUp = [...test.variants].sort((a, b) => b.score - a.score)[1]
  const active = test.variants.find((v) => v.id === activeId) ?? test.variants[0]

  const handleSuggestions = () => {
    setSuggesting(true)
    // Placeholder: AI suggestion endpoint will be wired to a FastAPI backend later
    setTimeout(() => setSuggesting(false), 2500)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">{test.name}</h1>
          <span className="rounded-sm border border-border px-2 py-1 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            Directional signal, not ground truth
          </span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {test.id} · {formatTimestamp(test.timestamp)} UTC
        </p>
      </div>

      {/* Winner callout */}
      <section className="rounded-sm border border-primary bg-card" aria-label="Winner">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Trophy className="size-4 text-primary" />
          <span className="font-mono text-[11px] tracking-widest uppercase text-primary">
            Winner · Variant {winner.label}
          </span>
        </div>
        <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-pretty">{test.winnerReason}</p>
          <div className="flex items-stretch gap-px overflow-hidden rounded-sm border border-border bg-border">
            <div className="flex flex-col gap-1 bg-card px-6 py-4">
              <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                Var {winner.label}
              </span>
              <span className="font-mono text-3xl font-semibold text-primary">{winner.score}</span>
            </div>
            {runnerUp && (
              <div className="flex flex-col gap-1 bg-card px-6 py-4">
                <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  Var {runnerUp.label}
                </span>
                <span className="font-mono text-3xl font-semibold text-muted-foreground">{runnerUp.score}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Variant tabs */}
      <div role="tablist" aria-label="Variant detail" className="flex gap-6 border-b border-border">
        {test.variants.map((variant) => (
          <button
            key={variant.id}
            role="tab"
            aria-selected={variant.id === activeId}
            onClick={() => setActiveId(variant.id)}
            className={cn(
              '-mb-px border-b-2 pb-3 font-mono text-xs tracking-widest uppercase transition-colors',
              variant.id === activeId
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {variant.label}
            {variant.id === test.winnerId && <span className="ml-1.5 text-primary">•</span>}
          </button>
        ))}
      </div>

      {/* Per-variant detail */}
      <section className="rounded-sm border border-border bg-card" aria-label={`Variant ${active.label} detail`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
          <span className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground">
            Engagement over time · Variant {active.label}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">{active.note}</span>
        </div>
        <div className="p-4 md:p-5">
          <EngagementChart curve={active.curve} />
        </div>
      </section>

      {/* Overlay */}
      <section className="rounded-sm border border-border bg-card" aria-label="Composite curves overlaid">
        <div className="border-b border-border px-5 py-3">
          <span className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground">
            Engagement, overlaid · composite per variant
          </span>
        </div>
        <div className="p-4 md:p-5">
          <OverlayChart variants={test.variants} winnerId={test.winnerId} />
        </div>
      </section>

      {/* Why panel */}
      <section className="rounded-sm border border-border bg-card" aria-label="Score breakdown">
        <div className="border-b border-border px-5 py-3">
          <span className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground">
            Why Variant {active.label} scored {active.score}
          </span>
        </div>
        <ul className="flex flex-col gap-3 p-5">
          {active.drivers.map((driver) => (
            <li key={driver} className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="mt-2 size-1 shrink-0 bg-primary" aria-hidden="true" />
              <span className="text-pretty">{driver}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border p-5">
          <button
            type="button"
            onClick={handleSuggestions}
            disabled={suggesting}
            className="flex items-center gap-2 rounded-sm border border-foreground px-4 py-2.5 font-mono text-xs tracking-wide uppercase text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-wait disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
          >
            {suggesting ? (
              <>
                <WaveformIcon animated className="size-4" />
                Generating suggestions...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Get suggestions
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  )
}
