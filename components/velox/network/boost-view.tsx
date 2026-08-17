'use client'

import { Rocket, Lock, Check, Timer, Zap } from 'lucide-react'
import { Panel, StatTile, ProgressBar, StatusPill, SectionLabel } from '@/components/velox/primitives'
import { demoBoosts } from '@/lib/demo-data'
import { formatUSDT, formatNumber, percentOf, safeArray } from '@/lib/format'
import type { PartnerBoost } from '@/lib/types'

function boostStatus(status: string): { tone: 'active' | 'success' | 'neutral'; label: string } {
  if (status === 'completed') return { tone: 'success', label: 'Tamamlandı' }
  if (status === 'locked') return { tone: 'neutral', label: 'Kilitli' }
  return { tone: 'active', label: 'Aktif' }
}

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

function BoostCard({ boost }: { boost: PartnerBoost }) {
  const s = boostStatus(boost.status)
  const pct = percentOf(boost.progress, boost.target)
  const locked = boost.status === 'locked'
  const done = boost.status === 'completed'

  return (
    <Panel className={locked ? 'opacity-70' : ''}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-11 items-center justify-center rounded-xl ${
              locked ? 'bg-muted text-muted-foreground' : 'velox-gradient text-primary-foreground'
            }`}
          >
            {locked ? <Lock className="size-5" /> : done ? <Check className="size-5" /> : <Rocket className="size-5" />}
          </div>
          <div>
            <h3 className="font-semibold leading-tight text-balance">{boost.title}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="size-3.5 text-primary" />
              {formatNumber(boost.multiplier, 2)}x komisyon
            </div>
          </div>
        </div>
        <StatusPill tone={s.tone}>{s.label}</StatusPill>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">{boost.description}</p>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">İlerleme</span>
          <span className="font-mono tabular-nums">
            {boost.unit === 'USDT'
              ? `${formatUSDT(boost.progress, 0)} / ${formatUSDT(boost.target, 0)}`
              : `${formatNumber(boost.progress, 0)} / ${formatNumber(boost.target, 0)}`}
          </span>
        </div>
        <ProgressBar value={pct} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Timer className="size-3.5" />
          {daysLeft(boost.endsAt)}
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Ödül</div>
          <div className="font-mono text-sm font-semibold text-primary tabular-nums">
            {boost.reward > 0 ? formatUSDT(boost.reward, 0) : '—'}
          </div>
        </div>
      </div>
    </Panel>
  )
}

export function BoostView() {
  const boosts = safeArray<PartnerBoost>(demoBoosts)
  const active = boosts.filter((b) => b?.status === 'active').length
  const totalReward = boosts
    .filter((b) => b?.status === 'active' || b?.status === 'completed')
    .reduce((sum, b) => sum + (Number(b?.reward) || 0), 0)
  const earned = boosts
    .filter((b) => b?.status === 'completed')
    .reduce((sum, b) => sum + (Number(b?.reward) || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Partner Boost</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Hedefe dayalı komisyon çarpanlarıyla belirli süre içinde ekstra kazanç elde edin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Aktif boost" value={formatNumber(active, 0)} />
        <StatTile label="Potansiyel ödül" value={`${formatUSDT(totalReward, 0)}`} />
        <StatTile label="Kazanılan" value={`${formatUSDT(earned, 0)}`} accent />
      </div>

      <div>
        <SectionLabel>Kampanyalar</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2">
          {boosts.map((b) => (
            <BoostCard key={b.id} boost={b} />
          ))}
        </div>
      </div>
    </div>
  )
}
