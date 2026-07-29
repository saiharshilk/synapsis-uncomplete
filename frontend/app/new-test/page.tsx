'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { VariantUploadCard, type VariantDraft } from '@/components/variant-upload-card'

const LABELS = ['A', 'B', 'C', 'D']

export default function NewTestPage() {
  const router = useRouter()
  const [testName, setTestName] = useState('')
  const [variants, setVariants] = useState<VariantDraft[]>([
    { id: 'v-0', label: 'A', note: '', fileName: null },
  ])

  const hasVideo = variants.some((v) => v.fileName)

  const updateVariant = (updated: VariantDraft) => {
    setVariants((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
  }

  const addVariant = () => {
    setVariants((prev) => {
      if (prev.length >= 4) return prev
      const next = [...prev, { id: `v-${Date.now()}`, label: '', note: '', fileName: null }]
      return next.map((v, i) => ({ ...v, label: LABELS[i] }))
    })
  }

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id).map((v, i) => ({ ...v, label: LABELS[i] })))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 md:px-6 md:py-16">
        <p className="mb-2 font-mono text-[11px] tracking-widest uppercase text-muted-foreground">New test</p>
        <h1 className="mb-10 text-2xl font-semibold tracking-tight text-balance md:text-3xl">
          Upload your variants
        </h1>

        <div className="mb-10 flex flex-col gap-1.5">
          <label htmlFor="test-name" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            Test name (optional)
          </label>
          <input
            id="test-name"
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g. Cold open vs. text hook"
            className="rounded-sm border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-6">
          {variants.map((variant) => (
            <VariantUploadCard
              key={variant.id}
              variant={variant}
              onChange={updateVariant}
              onRemove={() => removeVariant(variant.id)}
              removable={variants.length > 1}
            />
          ))}
        </div>

        {variants.length < 4 && (
          <button
            type="button"
            onClick={addVariant}
            className="mt-6 flex items-center gap-2 font-mono text-xs tracking-wide uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="size-4" />
            Add another variant
          </button>
        )}

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8">
          <button
            type="button"
            disabled={!hasVideo}
            onClick={() => router.push('/scoring')}
            className="w-full rounded-sm bg-primary px-5 py-3 font-mono text-xs tracking-wide uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground md:w-auto md:self-start md:px-8"
          >
            Run test
          </button>
          {!hasVideo && (
            <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              Add at least one video to run
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
