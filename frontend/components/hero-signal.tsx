export function HeroSignal() {
  return (
    <div className="relative rounded-sm border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
          Live signal · ch.04
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-primary">
          <span
            className="inline-block size-1.5 rounded-full bg-primary"
            style={{ animation: 'signal-pulse 1.6s ease-in-out infinite' }}
          />
          Reading
        </span>
      </div>

      <svg viewBox="0 0 400 200" className="w-full" role="img" aria-label="Animated neural signal waveform">
        {/* grid */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 33 + 1}
            x2="400"
            y2={i * 33 + 1}
            stroke="var(--border)"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="200" stroke="var(--border)" strokeWidth="0.5" />
        ))}

        {/* faint secondary trace */}
        <path
          d="M0 120 L30 118 L50 130 L70 112 L95 125 L120 105 L145 122 L170 110 L200 128 L230 108 L255 120 L285 112 L310 126 L340 114 L370 122 L400 116"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* main pulse trace */}
        <path
          d="M0 100 L40 100 L55 60 L70 140 L85 40 L100 100 L150 100 L165 75 L180 120 L195 100 L245 100 L260 55 L275 145 L290 45 L305 100 L355 100 L370 80 L385 112 L400 100"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinecap="square"
          strokeDasharray="600 200"
          style={{ animation: 'signal-dash 5s linear infinite' }}
        />
      </svg>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
        <span>0.0s</span>
        <span>amp 1.0x</span>
        <span>15.0s</span>
      </div>
    </div>
  )
}
