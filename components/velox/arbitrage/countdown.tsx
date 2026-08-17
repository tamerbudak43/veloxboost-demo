'use client'

import { useEffect, useState } from 'react'
import type { ArbitragePhase } from '@/lib/types'
import { formatCountdown, safeNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Phase countdown. Structured to consume backend phase values.
 * When the timer hits zero it shows a clean "Hesaplanıyor..." settling state.
 */
export function PhaseCountdown({ phase }: { phase: ArbitragePhase }) {
  const endsAtMs = new Date(phase?.endsAt ?? Date.now()).getTime()
  // Time-based values differ between the server render and client hydration,
  // so we render a stable placeholder until mounted, then tick on the client.
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const target = Number.isFinite(endsAtMs) ? endsAtMs : Date.now()
    const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAtMs])

  const mounted = remaining !== null
  const settling = mounted && (remaining <= 0 || phase?.status === 'settling')

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
        <span className="size-1.5 animate-pulse rounded-full bg-cyan" />
        <span className="text-xs text-muted-foreground">Aşama bitişine:</span>
        {settling ? (
          <span className="text-xs font-semibold text-bright">Hesaplanıyor...</span>
        ) : (
          <span className="font-mono text-sm font-semibold tabular-nums velox-gradient-text">
            {mounted ? formatCountdown(remaining ?? 0) : '--:--'}
          </span>
        )}
        <span className={cn('ml-1 text-[10px] uppercase tracking-wider text-muted-foreground')}>
          #{safeNumber(phase?.phaseNumber)}
        </span>
      </div>
    </div>
  )
}
