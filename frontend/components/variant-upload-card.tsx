'use client'

import { useRef } from 'react'
import { Upload, FileVideo, X } from 'lucide-react'

export interface VariantDraft {
  id: string
  label: string
  note: string
  fileName: string | null
}

export function VariantUploadCard({
  variant,
  onChange,
  onRemove,
  removable,
}: {
  variant: VariantDraft
  onChange: (v: VariantDraft) => void
  onRemove: () => void
  removable: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-sm border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Variant {variant.label}
        </span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Remove variant ${variant.label}`}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 md:p-5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) onChange({ ...variant, fileName: file.name })
          }}
          className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-input bg-background px-4 py-8 transition-colors hover:border-primary"
        >
          {variant.fileName ? (
            <>
              <FileVideo className="size-5 text-primary" />
              <span className="font-mono text-xs text-foreground">{variant.fileName}</span>
              <span className="font-mono text-[10px] tracking-widest uppercase text-primary">Loaded</span>
            </>
          ) : (
            <>
              <Upload className="size-5 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">Drop video or click to browse</span>
              <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                mp4 · mov · max 60s
              </span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onChange({ ...variant, fileName: file.name })
          }}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`note-${variant.id}`}
            className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground"
          >
            What changed (optional)
          </label>
          <input
            id={`note-${variant.id}`}
            type="text"
            value={variant.note}
            onChange={(e) => onChange({ ...variant, note: e.target.value })}
            placeholder="e.g. cold open, no title card"
            className="rounded-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  )
}
