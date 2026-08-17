'use client'

import { useState } from 'react'
import { Trophy, Timer, Crown, Medal } from 'lucide-react'
import { Panel, StatTile, StatusPill } from '@/components/velox/primitives'
import { PartnerAvatar } from '@/components/velox/network/partner-avatar'
import { demoChallenges } from '@/lib/demo-data'
import { formatUSDT, formatNumber, safeArray } from '@/lib/format'
import type { Challenge } from '@/lib/types'
import { cn } from '@/lib/utils'

function daysLeft(endsAt: string): string {
  const end = new Date(endsAt).getTime()
  if (Number.isNaN(end)) return '—'
  const diff = end - Date.now()
  if (diff <= 0) return 'Sona erdi'
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  if (days > 0) return `${days} gün ${hours} sa`
  return `${hours} sa`
}

function rankBadge(rank: number) {
  if (rank === 1) return <Crown className="size-4 text-amber-300" />
  if (rank === 2) return <Medal className="size-4 text-slate-300" />
  if (rank === 3) return <Medal className="size-4 text-amber-600" />
  return <span className="w-4 text-center font-mono text-xs text-muted-foreground">{rank}</span>
}

export function ChallengeView() {
  const challenges = safeArray<Challenge>(demoChallenges)
  const [activeId, setActiveId] = useState<string>(challenges[0]?.id ?? '')
  const active = challenges.find((c) => c?.id === activeId) ?? challenges[0]

  if (!active) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partner Challenge</h1>
          <p className="mt-1 text-sm text-muted-foreground">Şu anda aktif yarışma bulunmuyor.</p>
        </div>
      </div>
    )
  }

  const board = safeArray<Challenge['leaderboard'][number]>(active.leaderboard)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Partner Challenge</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Liderlik tablosunda yüksel, ödül havuzundan pay al. Sıralaman gerçek zamanlı hesaplanır.
        </p>
      </div>

      {/* Challenge selector */}
      <div className="flex flex-wrap gap-2">
        {challenges.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveId(c.id)}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              c.id === active.id
                ? 'border-electric/40 bg-electric/10 text-bright'
                : 'border-border bg-surface text-muted-foreground hover:text-foreground',
            )}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatTile label="Ödül havuzu" value={formatUSDT(active.prizePool, 0)} accent />
        <StatTile
          label="Senin sıran"
          value={`#${formatNumber(active.myRank, 0)}`}
          hint={`Skor: ${formatNumber(active.myScore, 0)}`}
        />
        <StatTile label="Kalan süre" value={daysLeft(active.endsAt)} />
      </div>

      <Panel className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            <h2 className="font-semibold">Liderlik tablosu</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="size-3.5" />
            {active.metric}
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {board.map((row) => {
            const isMe = row?.name === 'Sen'
            return (
              <div
                key={row.rank}
                className={cn(
                  'flex items-center gap-3 px-5 py-3',
                  isMe && 'bg-electric/5',
                )}
              >
                <div className="flex w-6 shrink-0 items-center justify-center">{rankBadge(row.rank)}</div>
                <PartnerAvatar seed={row.veloxId} name={row.name} className="size-9" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('truncate font-medium', isMe && 'text-bright')}>{row.name}</span>
                    {isMe ? <StatusPill tone="active">Sen</StatusPill> : null}
                  </div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{row.veloxId}</div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Skor</div>
                  <div className="font-mono text-sm tabular-nums">{formatNumber(row.score, 0)}</div>
                </div>
                <div className="w-24 text-right">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Ödül</div>
                  <div className="font-mono text-sm font-semibold text-primary tabular-nums">
                    {formatUSDT(row.prize, 0)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
