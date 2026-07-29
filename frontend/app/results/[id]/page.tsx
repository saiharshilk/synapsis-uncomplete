import { notFound } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { ResultsView } from '@/components/results/results-view'
import { getTest } from '@/lib/mock-data'

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const test = getTest(id)

  if (!test) notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 md:px-6 md:py-16">
        <ResultsView test={test} />
      </main>
    </div>
  )
}
