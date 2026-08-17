'use client'

import { Award, CheckCircle2, Circle, Lock, TrendingUp } from 'lucide-react'
import {
  PageHeader,
  Panel,
  PanelHeader,
  StatTile,
  Eyebrow,
} from '@/components/velox/primitives'
import { formatUSDT, safeNumber, clampProgress } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CareerDef, CareerProgress, NetworkSummary } from '@/lib/network/types'

interface CareerViewProps {
  summary: NetworkSummary
  careerProgress: CareerProgress
  careers: CareerDef[]
  unlockedDepth: number
  reward: { total: number; accrued: number; pending: number } | null
}

function fmt(value: number, format: 'count' | 'usdt') {
  return format === 'usdt' ? formatUSDT(value) : String(safeNumber(value))
}

export function CareerView({ summary, careerProgress, careers, unlockedDepth, reward }: CareerViewProps) {
  const { currentCareer, nextCareer, progress, requirements } = careerProgress
  const ordered = [...careers].sort((a, b) => a.displayOrder - b.displayOrder)
  const currentOrder = currentCareer.displayOrder

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kariyer Gelişim Planı"
        description="Sponsor ağını büyüt, kariyer basamaklarını yükselt ve daha derin komisyon seviyelerinin kilidini aç."
      />

      {/* Current / next hero */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-lg bg-electric/15 text-electric">
                  <Award className="size-6" />
                </span>
                <div>
                  <Eyebrow>Mevcut kariyer</Eyebrow>
                  <p className="text-lg font-semibold text-bright">{currentCareer.name}</p>
                </div>
              </div>
              {nextCareer ? (
                <div className="text-right">
                  <Eyebrow>Sonraki hedef</Eyebrow>
                  <p className="text-lg font-semibold velox-gradient-text">{nextCareer.name}</p>
                </div>
              ) : (
                <span className="rounded-md border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  En üst kariyer
                </span>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-secondary-foreground">
                <span>Genel ilerleme</span>
                <span className="font-mono font-semibold text-bright">%{Math.round(progress)}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full velox-gradient transition-all"
                  style={{ width: `${clampProgress(progress)}%` }}
                />
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-4">
          <StatTile label="Açılan Derinlik" value={`${unlockedDepth} / 33`} />
          <StatTile label="Günlük Çekim Limiti" value={formatUSDT(currentCareer.dailyWithdrawalLimit)} />
        </div>
      </div>
      {reward && <div className="grid grid-cols-3 gap-3"><StatTile label="Toplam kariyer ödülü" value={formatUSDT(reward.total)} /><StatTile label="Tahakkuk eden" value={formatUSDT(reward.accrued)} /><StatTile label="Onay bekleyen" value={formatUSDT(reward.pending)} accent /></div>}

      {/* Requirements */}
      {nextCareer && (
        <Panel>
          <PanelHeader
            title={`${nextCareer.name} için gereksinimler`}
            right={<Eyebrow>{requirements.filter((r) => r.met).length}/{requirements.length} tamamlandı</Eyebrow>}
          />
          <div className="divide-y divide-border">
            {requirements.map((r) => (
              <div key={r.key} className="flex items-center gap-4 px-4 py-3">
                <span className={cn('shrink-0', r.met ? 'text-success' : 'text-muted-foreground')}>
                  {r.met ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-foreground">{r.label}</span>
                    <span className="shrink-0 font-mono text-xs text-secondary-foreground">
                      {fmt(r.current, r.format)} / {fmt(r.required, r.format)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                    <div
                      className={cn('h-full rounded-full', r.met ? 'bg-success' : 'velox-gradient')}
                      style={{ width: `${clampProgress(r.progress)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Career ladder */}
      <Panel>
        <PanelHeader title="Kariyer basamakları" right={<Eyebrow>{ordered.length} seviye</Eyebrow>} />
        <div className="divide-y divide-border">
          {ordered.map((c) => {
            const reached = c.displayOrder <= currentOrder
            const isCurrent = c.code === currentCareer.code
            const isNext = nextCareer?.code === c.code
            return (
              <div
                key={c.code}
                className={cn(
                  'flex items-center gap-4 px-4 py-3',
                  isCurrent && 'bg-electric/5',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold',
                    reached
                      ? 'bg-success/15 text-success'
                      : isNext
                        ? 'bg-electric/15 text-electric'
                        : 'bg-elevated text-muted-foreground',
                  )}
                >
                  {reached ? <CheckCircle2 className="size-4" /> : isNext ? <TrendingUp className="size-4" /> : <Lock className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    {isCurrent && (
                      <span className="rounded border border-electric/40 bg-electric/10 px-1.5 py-0.5 text-[10px] font-semibold text-electric">
                        MEVCUT
                      </span>
                    )}
                    {isNext && (
                      <span className="rounded border border-cyan/40 bg-cyan/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan">
                        SONRAKİ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.unlockedDepth} seviye derinlik · {formatUSDT(c.dailyWithdrawalLimit)} günlük limit
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Eyebrow>Kariyer ödülü</Eyebrow>
                  <p className="font-mono text-sm font-semibold text-bright">{formatUSDT(c.careerReward)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
