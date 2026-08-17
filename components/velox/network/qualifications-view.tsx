'use client'

import { Award, Check, Circle, ChevronRight } from 'lucide-react'
import {
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
  ProgressBar,
} from '@/components/velox/primitives'
import { formatUSDT, formatNumber, percentOf, clampProgress } from '@/lib/format'
import { careerRanks, demoUser, demoQualifications } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import type { Qualification } from '@/lib/types'

function formatQualValue(q: Qualification, value: number) {
  if (q.unit === 'USDT') return formatUSDT(value, 0)
  if (q.unit === 'legs') return `${formatNumber(value, 0)} bacak`
  return formatNumber(value, 0)
}

export function QualificationsView() {
  const quals = Array.isArray(demoQualifications) ? demoQualifications : []
  const metCount = quals.filter((q) => q.met).length
  const overall = percentOf(metCount, quals.length)

  const currentIndex = careerRanks.indexOf(demoUser.career as (typeof careerRanks)[number])

  return (
    <div>
      <PageHeader
        title="Rütbeler ve Yeterlilik"
        description="Kariyer rütbeleri ve bir sonraki rütbe için tamamlamanız gereken yeterlilik koşulları."
      />

      <Panel className="mb-4">
        <PanelHeader
          title="Kariyer yolu"
          right={<StatusPill tone="active">{demoUser.career}</StatusPill>}
        />
        <div className="flex flex-wrap items-center gap-2 p-4">
          {careerRanks.map((rank, i) => {
            const achieved = i <= currentIndex
            const isCurrent = i === currentIndex
            const isNext = i === currentIndex + 1
            return (
              <div key={rank} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-center',
                    isCurrent
                      ? 'border-electric/40 bg-electric/10'
                      : achieved
                        ? 'border-cyan/30 bg-cyan/5'
                        : isNext
                          ? 'border-border bg-elevated'
                          : 'border-border bg-card opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full border',
                      achieved ? 'border-cyan/40 bg-cyan/15 text-light-cyan' : 'border-border text-muted-foreground',
                    )}
                  >
                    {achieved ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
                  </span>
                  <span
                    className={cn(
                      'text-[11px] font-semibold tracking-wide',
                      isCurrent ? 'text-bright' : achieved ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {rank}
                  </span>
                </div>
                {i < careerRanks.length - 1 && (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title={`${demoUser.nextCareer} yeterliliği`}
          right={
            <span className="font-mono text-xs text-muted-foreground">
              {metCount}/{quals.length} tamamlandı
            </span>
          }
        />
        <div className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <Award className="size-5 text-bright" />
            <div className="flex-1">
              <ProgressBar value={clampProgress(overall)} />
            </div>
            <span className="font-mono text-sm tabular-nums text-foreground">{formatNumber(overall)}%</span>
          </div>

          <ul className="flex flex-col gap-2.5">
            {quals.map((q) => {
              const pct = percentOf(q.current, q.target)
              return (
                <li
                  key={q.id}
                  className="rounded-lg border border-border bg-elevated px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm text-foreground">
                      <span
                        className={cn(
                          'flex size-5 items-center justify-center rounded-full border text-[10px]',
                          q.met
                            ? 'border-cyan/40 bg-cyan/15 text-light-cyan'
                            : 'border-border text-muted-foreground',
                        )}
                      >
                        {q.met ? <Check className="size-3" /> : ''}
                      </span>
                      {q.label}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {formatQualValue(q, q.current)} / {formatQualValue(q, q.target)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={clampProgress(pct)} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </Panel>
    </div>
  )
}
