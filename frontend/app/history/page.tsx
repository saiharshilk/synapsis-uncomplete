import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { MOCK_TESTS, formatTimestamp, scoreDelta } from '@/lib/mock-data'

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 md:px-6 md:py-16">
        <p className="mb-2 font-mono text-[11px] tracking-widest uppercase text-muted-foreground">History</p>
        <h1 className="mb-10 text-2xl font-semibold tracking-tight md:text-3xl">Past tests</h1>

        <div className="overflow-x-auto rounded-sm border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-mono text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
                  Test
                </th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
                  Variants
                </th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
                  Winner
                </th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
                  Score
                </th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
                  Delta
                </th>
                <th className="px-4 py-3">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TESTS.map((test) => {
                const winner = test.variants.find((v) => v.id === test.winnerId)
                return (
                  <tr key={test.id} className="group relative border-b border-border last:border-b-0 hover:bg-muted/60">
                    <td className="px-4 py-4 font-medium">
                      <Link href={`/results/${test.id}`} className="after:absolute after:inset-0">
                        {test.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                      {formatTimestamp(test.timestamp)}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">{test.variants.length}</td>
                    <td className="px-4 py-4 font-mono text-xs text-primary">Var {winner?.label}</td>
                    <td className="px-4 py-4 font-mono text-xs">{winner?.score}</td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">+{scoreDelta(test)}</td>
                    <td className="px-4 py-4 text-right">
                      <ArrowUpRight className="ml-auto size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
          {MOCK_TESTS.length} tests · scores are directional
        </p>
      </main>
    </div>
  )
}
