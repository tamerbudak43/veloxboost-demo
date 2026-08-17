'use client'

import { useState } from 'react'
import { FileText, ChevronRight, Target, TrendingUp, CheckCircle2 } from 'lucide-react'
import {
  PageHeader,
  Panel,
  PanelHeader,
  StatTile,
  ProgressBar,
  StatusPill,
} from '@/components/velox/primitives'
import { DataTable, type Column } from '@/components/velox/data-table'
import {
  formatUSDT,
  formatDate,
  formatPercent,
  safeNumber,
  clampProgress,
} from '@/lib/format'
import { demoContracts, demoOperations } from '@/lib/demo-data'
import type { InvestmentContract, Operation } from '@/lib/types'
import { cn } from '@/lib/utils'

const statusTone: Record<string, 'success' | 'active' | 'neutral' | 'warning'> = {
  Active: 'active',
  Completed: 'success',
  Paused: 'warning',
  Cancelled: 'neutral',
}

const statusLabel: Record<string, string> = {
  Active: 'Aktif',
  Completed: 'Tamamlandı',
  Paused: 'Duraklatıldı',
  Cancelled: 'İptal',
}

export function ContractsView({
  contracts = demoContracts,
  operations = demoOperations,
}: {
  contracts?: InvestmentContract[]
  operations?: Operation[]
}) {
  const list = Array.isArray(contracts) ? contracts : []
  const [selectedId, setSelectedId] = useState<string | null>(list[0]?.id ?? null)
  const selected = list.find((c) => c.id === selectedId) ?? list[0] ?? null

  const totalInvested = list.reduce((sum, c) => sum + safeNumber(c.initialAmount), 0)
  const totalPaid = list.reduce((sum, c) => sum + safeNumber(c.totalPaid), 0)
  const activeCount = list.filter((c) => c.status === 'Active').length

  const relatedOps = (Array.isArray(operations) ? operations : []).filter(
    (o) => o.contractId === selected?.id,
  )

  const opColumns: Column<Operation>[] = [
    { key: 'type', header: 'İşlem tipi', cell: (o) => <span className="text-foreground">{o.operationType}</span> },
    { key: 'pool', header: 'Havuz / kaynak', cell: (o) => o.poolName },
    {
      key: 'amount',
      header: 'Tutar',
      align: 'right',
      cell: (o) => <span className="font-mono tabular-nums text-foreground">{formatUSDT(o.amount)}</span>,
    },
    { key: 'date', header: 'Tarih', align: 'right', cell: (o) => formatDate(o.createdAt) },
  ]

  return (
    <div>
      <PageHeader
        title="Sözleşmeler ve Faturalar"
        description="Yatırım sözleşmelerinizi, 1:3 tamamlanma ilerlemesini ve fatura hareketlerini görüntüleyin."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatTile label="Toplam yatırım" value={formatUSDT(totalInvested)} />
        <StatTile label="Toplam ödenen (1:3)" value={formatUSDT(totalPaid)} accent />
        <StatTile label="Aktif sözleşme" value={activeCount} hint={`${list.length} sözleşme toplam`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Panel>
          <PanelHeader title="Sözleşme listesi" />
          <ul className="divide-y divide-border/60">
            {list.length === 0 ? (
              <li className="px-4 py-12 text-center text-sm text-muted-foreground">
                Henüz sözleşme oluşturulmadı.
              </li>
            ) : (
              list.map((c) => {
                const isActive = c.id === selected?.id
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors',
                        isActive ? 'bg-elevated' : 'hover:bg-elevated/50',
                      )}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono text-[13px] font-medium text-foreground">
                            {c.contractNumber}
                          </span>
                          <StatusPill tone={statusTone[c.status] ?? 'neutral'}>
                            {statusLabel[c.status] ?? c.status}
                          </StatusPill>
                        </div>
                        <div className="mt-1.5">
                          <ProgressBar value={clampProgress(c.progress)} />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{formatUSDT(c.initialAmount, 2)} başlangıç</span>
                          <span className="tabular-nums">{formatPercent(c.progress)}</span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader title="Sözleşme detayı" />
          {selected ? (
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {selected.contractNumber}
                </span>
                <StatusPill tone={statusTone[selected.status] ?? 'neutral'}>
                  {statusLabel[selected.status] ?? selected.status}
                </StatusPill>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-elevated p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Target className="size-3.5" /> 1:3 hedef ilerlemesi
                  </span>
                  <span className="font-mono tabular-nums text-foreground">
                    {formatPercent(selected.progress)}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={clampProgress(selected.progress)} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{formatUSDT(selected.totalPaid, 2)} ödendi</span>
                  <span>{formatUSDT(selected.targetAmount, 2)} hedef</span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3">
                <DetailItem icon={<TrendingUp className="size-3.5" />} label="Başlangıç tutarı" value={formatUSDT(selected.initialAmount)} />
                <DetailItem icon={<TrendingUp className="size-3.5" />} label="Güncel kazanç" value={formatUSDT(selected.currentEarnings)} />
                <DetailItem icon={<Target className="size-3.5" />} label="Kalan tutar" value={formatUSDT(selected.remainingAmount)} />
                <DetailItem icon={<CheckCircle2 className="size-3.5" />} label="Toplam ödenen" value={formatUSDT(selected.totalPaid)} />
                <DetailItem label="Başlangıç tarihi" value={formatDate(selected.startDate)} />
                <DetailItem label="Tamamlanma" value={selected.completedAt ? formatDate(selected.completedAt) : '—'} />
              </dl>
            </div>
          ) : (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              Detay için bir sözleşme seçin.
            </div>
          )}
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHeader
          title="Fatura hareketleri"
          right={
            selected ? (
              <span className="font-mono text-xs text-muted-foreground">{selected.contractNumber}</span>
            ) : null
          }
        />
        <DataTable
          columns={opColumns}
          rows={relatedOps}
          getRowKey={(o) => o.id}
          empty={{
            title: 'Hareket yok',
            description: 'Bu sözleşmeye ait fatura hareketi bulunmuyor.',
            icon: <FileText className="size-4" />,
          }}
        />
      </Panel>
    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  )
}
