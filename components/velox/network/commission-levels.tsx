'use client'

import { Lock, Layers, Percent, Coins } from 'lucide-react'
import {
  PageHeader,
  Panel,
  PanelHeader,
  StatTile,
  StatusPill,
} from '@/components/velox/primitives'
import { DataTable, type Column } from '@/components/velox/data-table'
import { formatUSDT, formatPercent, safeNumber } from '@/lib/format'
import { demoCommissionLevels, demoUser } from '@/lib/demo-data'
import type { CommissionLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

export function CommissionLevelsView() {
  const levels = Array.isArray(demoCommissionLevels) ? demoCommissionLevels : []
  const unlocked = levels.filter((l) => l.unlocked)
  const totalEarned = levels.reduce((s, l) => s + safeNumber(l.earned), 0)
  const totalLevelVolume = levels.reduce((s, l) => s + safeNumber(l.levelVolume), 0)

  const columns: Column<CommissionLevel>[] = [
    {
      key: 'level',
      header: 'Seviye',
      cell: (l) => (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex size-7 items-center justify-center rounded-md border font-mono text-xs font-semibold',
              l.unlocked
                ? 'border-electric/30 bg-electric/10 text-bright'
                : 'border-border bg-surface text-muted-foreground',
            )}
          >
            {l.level}
          </span>
          {!l.unlocked && <Lock className="size-3.5 text-muted-foreground" />}
        </div>
      ),
    },
    {
      key: 'rate',
      header: 'Komisyon oranı',
      align: 'right',
      cell: (l) => <span className="font-mono tabular-nums text-foreground">{formatPercent(l.rate)}</span>,
    },
    {
      key: 'required',
      header: 'Gerekli kariyer',
      cell: (l) => <span className="text-xs">{l.requiredCareer}</span>,
    },
    {
      key: 'partners',
      header: 'Ortak',
      align: 'right',
      cell: (l) => <span className="font-mono tabular-nums">{l.unlocked ? l.partners : '—'}</span>,
    },
    {
      key: 'volume',
      header: 'Seviye hacmi',
      align: 'right',
      cell: (l) =>
        l.unlocked ? (
          <span className="font-mono tabular-nums">{formatUSDT(l.levelVolume, 0)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'earned',
      header: 'Kazanç',
      align: 'right',
      cell: (l) =>
        l.unlocked ? (
          <span className="font-mono tabular-nums text-light-cyan">{formatUSDT(l.earned, 2)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Durum',
      align: 'center',
      cell: (l) =>
        l.unlocked ? (
          <StatusPill tone="success">Açık</StatusPill>
        ) : (
          <StatusPill tone="neutral">Kilitli</StatusPill>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Partner Programı — 33 Seviye Komisyon"
        description="33 seviyeli komisyon mimarisi. Her seviye kariyer rütbenizle açılır ve seviye cirosundan komisyon kazandırır."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Açık seviye" value={`${unlocked.length} / 33`} accent hint={`Kariyer: ${demoUser.career}`} />
        <StatTile label="Toplam komisyon" value={formatUSDT(totalEarned)} />
        <StatTile label="Toplam seviye hacmi" value={formatUSDT(totalLevelVolume, 0)} />
        <StatTile
          label="Ortalama oran"
          value={formatPercent(
            unlocked.length > 0 ? unlocked.reduce((s, l) => s + l.rate, 0) / unlocked.length : 0,
          )}
        />
      </div>

      <Panel>
        <PanelHeader
          title="Komisyon seviyeleri"
          right={
            <span className="inline-flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Percent className="size-3.5" /> oran
              </span>
              <span className="inline-flex items-center gap-1">
                <Coins className="size-3.5" /> kazanç
              </span>
            </span>
          }
        />
        <DataTable
          columns={columns}
          rows={levels}
          getRowKey={(l) => String(l.level)}
          empty={{ title: 'Seviye yok', icon: <Layers className="size-4" /> }}
        />
      </Panel>
    </div>
  )
}
