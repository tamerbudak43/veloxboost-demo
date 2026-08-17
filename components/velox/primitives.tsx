import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Terminal panel surface with fine borders. */
export function Panel({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PanelHeader({
  title,
  right,
  className,
}: {
  title: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-border px-4 py-3',
        className,
      )}
    >
      <h2 className="text-sm font-semibold tracking-wide text-foreground">{title}</h2>
      {right}
    </div>
  )
}

/** Compact section eyebrow label. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Key/value stat tile used across statistics pages. */
export function StatTile({
  label,
  value,
  hint,
  accent = false,
  className,
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  accent?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card px-4 py-3.5',
        accent && 'bg-elevated',
        className,
      )}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          'mt-1.5 font-mono text-lg font-semibold tabular-nums text-foreground',
          accent && 'velox-gradient-text',
        )}
      >
        {value}
      </div>
      {hint ? <div className="mt-0.5 text-xs text-secondary-foreground/70">{hint}</div> : null}
    </div>
  )
}

/** Polished empty state for tables. */
export function EmptyState({
  title = 'Henüz veri yok',
  description = 'İşlemler gerçekleştiğinde burada görüntülenecek.',
  icon,
  className,
}: {
  title?: string
  description?: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-6 py-14 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-1 flex size-11 items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

/** VELOX gradient progress bar. */
export function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface', className)}>
      <div className="velox-gradient h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Small status pill. */
export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'active'
}) {
  const tones: Record<string, string> = {
    neutral: 'border-border bg-surface text-secondary-foreground',
    success: 'border-cyan/30 bg-cyan/10 text-light-cyan',
    active: 'border-electric/40 bg-electric/10 text-bright',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    danger: 'border-destructive/40 bg-destructive/10 text-destructive-foreground',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

/** Small uppercase section label used above content groups. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </div>
  )
}

/** Standard page header (title + optional description/actions). */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground text-balance">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  )
}
