import { cn } from '@/lib/utils'

/** A compact USDT/Tether mark for every USDT amount shown in the product. */
export function TetherIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="USDT"
      className={cn('inline-block shrink-0', className)}
    >
      <circle cx="32" cy="32" r="30" fill="#26A17B" />
      <path
        fill="#fff"
        d="M13 14h38v8H37.5v5.2c10.8.7 17.5 2.8 17.5 5.1 0 2.4-6.7 4.5-17.5 5.2V51h-11V37.5C15.7 36.8 9 34.7 9 32.3c0-2.3 6.7-4.4 17.5-5.1V22H13v-8Zm19 15.1c-10 0-16.5 1.7-16.5 3.2S22 35.5 32 35.5s16.5-1.7 16.5-3.2S42 29.1 32 29.1Z"
      />
    </svg>
  )
}

export function UsdtAmount({
  value,
  className,
  iconClassName,
}: {
  value: string
  className?: string
  iconClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      <span>{value.replace(/\s*USDT$/, '')}</span>
      <TetherIcon className={cn('size-[1.05em]', iconClassName)} />
    </span>
  )
}

export function UsdtLabel({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <TetherIcon className="size-[1.15em]" />
    </span>
  )
}
