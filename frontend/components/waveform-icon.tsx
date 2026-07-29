import { cn } from '@/lib/utils'

export function WaveformIcon({
  className,
  animated = false,
}: {
  className?: string
  animated?: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      className={cn('size-5', className)}
      aria-hidden="true"
    >
      <path
        d="M1 12h3l2-7 3 14 3-11 2 6 2-2h7"
        style={
          animated
            ? {
                strokeDasharray: '60',
                animation: 'signal-dash 2.4s linear infinite',
              }
            : undefined
        }
      />
    </svg>
  )
}
