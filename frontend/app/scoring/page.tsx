'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SiteNav } from '@/components/site-nav'
import { WaveformIcon } from '@/components/waveform-icon'

export default function ScoringPage() {
  const router = useRouter()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // Mock: navigate to results after a short scoring window
  useEffect(() => {
    const timeout = setTimeout(() => router.push('/results/tst-0042'), 8000)
    return () => clearTimeout(timeout)
  }, [router])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <WaveformIcon animated className="size-10 text-primary" />
          <div className="flex flex-col gap-2">
            <p className="font-mono text-sm tracking-wide uppercase text-foreground" aria-live="polite">
              Reading neural signal...
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
              Cold starts can take a few minutes while the encoding model warms up.
            </p>
          </div>
          <p className="font-mono text-xs tracking-widest text-muted-foreground" aria-label="Elapsed time">
            {minutes}m {String(seconds).padStart(2, '0')}s
          </p>
        </div>
      </main>
    </div>
  )
}
