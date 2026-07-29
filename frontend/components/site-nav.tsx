'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { WaveformIcon } from '@/components/waveform-icon'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/new-test', label: 'New Test' },
  { href: '/results/tst-0042', label: 'Results' },
  { href: '/history', label: 'History' },
  { href: '/#how-it-works', label: 'How It Works' },
]

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <WaveformIcon className="size-5 text-primary" />
          <span className="font-mono text-sm font-semibold tracking-wide uppercase">Synapsis</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : link.href.startsWith('/#')
                  ? false
                  : pathname.startsWith(link.href.split('/').slice(0, 2).join('/'))
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'font-mono text-xs tracking-wide uppercase transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            )
          })}
          <button
            type="button"
            className="rounded-sm border border-foreground px-3 py-1.5 font-mono text-xs tracking-wide uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Sign in
          </button>
        </div>

        <button
          type="button"
          className="flex items-center text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2 font-mono text-xs tracking-wide uppercase text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="mt-2 rounded-sm border border-foreground px-3 py-2 font-mono text-xs tracking-wide uppercase text-foreground"
            >
              Sign in
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
