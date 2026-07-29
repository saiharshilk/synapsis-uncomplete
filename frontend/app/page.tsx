import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { HeroSignal } from '@/components/hero-signal'

const STEPS = [
  {
    number: '01',
    title: 'Upload',
    body: 'Drop in up to four hook variants of the same video. Label what changed between each cut — the opener, the pacing, the overlay.',
  },
  {
    number: '02',
    title: 'Predict',
    body: 'A neural brain-encoding model simulates how visual, auditory, language, motion, and default-mode networks respond, second by second.',
  },
  {
    number: '03',
    title: 'Compare',
    body: 'Get a composite attention score per variant, overlaid engagement curves, and a plain-English readout of why one hook holds and another leaks.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24">
          <div className="flex flex-col items-start gap-6">
            <p className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground">
              Neural attention prediction · v0.4
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
              Test what your video does to a brain before you post it.
            </h1>
            <p className="max-w-md leading-relaxed text-muted-foreground text-pretty">
              Upload hook variants of the same clip. Synapsis runs each one through a neural brain-encoding model and
              returns a predicted attention score — so you post the cut that holds.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/new-test"
                className="rounded-sm bg-primary px-5 py-2.5 font-mono text-xs tracking-wide uppercase text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start a test
              </Link>
              <Link
                href="/results/tst-0042"
                className="rounded-sm border border-foreground px-5 py-2.5 font-mono text-xs tracking-wide uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                See an example
              </Link>
            </div>
          </div>
          <HeroSignal />
        </section>

        {/* Process */}
        <section id="how-it-works" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
            <p className="mb-10 font-mono text-[11px] tracking-widest uppercase text-muted-foreground">
              How it works
            </p>
            <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number} className="flex flex-col gap-4 bg-background p-6 md:p-8">
                  <span className="font-mono text-xs text-primary">{step.number}</span>
                  <h2 className="text-lg font-semibold">{step.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 font-mono text-[11px] tracking-wide uppercase text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <span>Synapsis — predictive attention instrument</span>
          <span>Directional signal, not ground truth</span>
        </div>
      </footer>
    </div>
  )
}
