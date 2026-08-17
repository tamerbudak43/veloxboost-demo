import { cn } from '@/lib/utils'

export function VeloxMark({ className, size = 26 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="velox-mark-a" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#063F9F" />
          <stop offset="0.45" stopColor="#0877E8" />
          <stop offset="1" stopColor="#18D4E8" />
        </linearGradient>
        <linearGradient id="velox-mark-b" x1="12" y1="8" x2="52" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0AA9F4" />
          <stop offset="1" stopColor="#49E4F2" />
        </linearGradient>
      </defs>
      {/* left shard */}
      <path d="M4 14 L34 14 L26 30 L20 30 Z" fill="url(#velox-mark-a)" />
      {/* right shard */}
      <path d="M34 14 L60 14 L40 24 L30 24 Z" fill="url(#velox-mark-b)" />
      {/* descending point forming the V */}
      <path d="M20 30 L40 24 L30 52 L24 42 Z" fill="url(#velox-mark-a)" />
    </svg>
  )
}

export function VeloxLogo({
  className,
  showWordmark = true,
  size = 26,
}: {
  className?: string
  showWordmark?: boolean
  size?: number
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <VeloxMark size={size} />
      {showWordmark && (
        <span className="text-lg font-bold tracking-[0.2em] text-foreground">VELOX</span>
      )}
    </span>
  )
}
