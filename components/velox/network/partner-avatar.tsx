import { cn } from '@/lib/utils'

/** Deterministic initials avatar (no external images, SSR-safe). */
export function PartnerAvatar({
  name,
  seed,
  className,
}: {
  name: string
  seed: string
  className?: string
}) {
  const initials = name
    .split(' ')
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // stable hue from seed
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 360

  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-foreground',
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hash} 45% 22%), hsl(${(hash + 40) % 360} 55% 30%))`,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
