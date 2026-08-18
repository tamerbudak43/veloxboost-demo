'use client'

import { useState } from 'react'
import { ExternalLink, Inbox } from 'lucide-react'
import { EmptyState, StatusPill } from '@/components/velox/primitives'
import { formatDateTime, formatNumber, formatUSDT, safeNumber } from '@/lib/format'
import type { Accrual, ArbitrageTrade, Operation } from '@/lib/types'
import { cn } from '@/lib/utils'
import { UsdtAmount, UsdtLabel } from '@/components/velox/tether-icon'

type Tab = 'islemler' | 'tahakkuklar' | 'operasyonlar'

const tabs: { id: Tab; label: string }[] = [
  { id: 'islemler', label: 'İşlemler' },
  { id: 'tahakkuklar', label: 'Tahakkuklar' },
  { id: 'operasyonlar', label: 'Operasyonlar' },
]

export function TradeHistory({
  trades,
  accruals,
  operations,
}: {
  trades: ArbitrageTrade[]
  accruals: Accrual[]
  operations: Operation[]
}) {
  const [tab, setTab] = useState<Tab>('islemler')

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">İşlem geçmişi</h2>
        <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium transition-colors',
                tab === t.id
                  ? 'velox-gradient text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {tab === 'islemler' && <TradesTable trades={trades} />}
        {tab === 'tahakkuklar' && <AccrualsTable accruals={accruals} />}
        {tab === 'operasyonlar' && <OperationsTable operations={operations} />}
      </div>
    </div>
  )
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
        right ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  right,
  className,
}: {
  children: React.ReactNode
  right?: boolean
  className?: string
}) {
  return (
    <td
      className={cn(
        'whitespace-nowrap px-4 py-2.5 font-mono text-xs tabular-nums text-foreground',
        right ? 'text-right' : 'text-left',
        className,
      )}
    >
      {children}
    </td>
  )
}

function ExchangeTag({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-sans text-xs font-medium text-secondary-foreground">
      {name}
      <ExternalLink className="size-3 text-muted-foreground" />
    </span>
  )
}

function openTradeDetail(trade: ArbitrageTrade) {
  const params = new URLSearchParams({
    id: String(trade?.id ?? 'demo-trade'),
    createdAt: String(trade?.createdAt ?? new Date().toISOString()),
    buyExchange: String(trade?.buyExchange ?? '-'),
    sellExchange: String(trade?.sellExchange ?? '-'),
    buyPrice: String(safeNumber(trade?.buyPrice)),
    sellPrice: String(safeNumber(trade?.sellPrice)),
    volume: String(safeNumber(trade?.buyVolume)),
    spread: String(safeNumber(trade?.netSpread)),
  })
  window.open(`/trade-demo?${params.toString()}`, '_blank', 'noopener,noreferrer')
}

function TradesTable({ trades }: { trades: ArbitrageTrade[] }) {
  const rows = Array.isArray(trades) ? trades : []
  if (rows.length === 0) {
    return <EmptyState icon={<Inbox className="size-5" />} />
  }
  return (
    <table className="w-full min-w-[720px] border-collapse">
      <thead>
        <tr className="border-b border-border">
          <Th>Tarih/Saat</Th>
          <Th>Alış Fiyatı</Th>
          <Th>Satış Fiyatı <UsdtLabel /></Th>
          <Th right>Toplam Spread <UsdtLabel /></Th>
          <Th right>Net Spread <UsdtLabel /></Th>
          <Th right>Durum</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr
            key={t?.id}
            role="button"
            tabIndex={0}
            onClick={() => openTradeDetail(t)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openTradeDetail(t)
              }
            }}
            className="cursor-pointer border-b border-border/60 outline-none last:border-0 hover:bg-elevated/70 focus-visible:bg-elevated/70"
            aria-label="Bu işlemin demo ayrıntısını ve simülasyon TXID bilgisini yeni sekmede aç"
          >
            <Td className="text-secondary-foreground">{formatDateTime(t?.createdAt)}</Td>
            <Td>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-bright">{formatNumber(t?.buyPrice, 2)}</span>
                <ExchangeTag name={t?.buyExchange ?? '-'} />
              </div>
            </Td>
            <Td>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-bright">{formatNumber(t?.sellPrice, 2)}</span>
                <ExchangeTag name={t?.sellExchange ?? '-'} />
              </div>
            </Td>
            <Td right className="text-secondary-foreground">
              {formatNumber(t?.grossSpread, 4)}
            </Td>
            <Td right className="font-semibold text-light-cyan">
              +{formatNumber(t?.netSpread, 4)}
            </Td>
            <td className="px-4 py-2.5 text-right">
              <StatusPill tone="success">Tamamlandı</StatusPill>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function accrualTone(status: string) {
  switch (status) {
    case 'Serbest':
    case 'Ödendi':
      return 'success' as const
    case 'Tahakkuk Etti':
      return 'active' as const
    default:
      return 'neutral' as const
  }
}

function AccrualsTable({ accruals }: { accruals: Accrual[] }) {
  const rows = Array.isArray(accruals) ? accruals : []
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="size-5" />}
        title="Henüz veri yok"
        description="İşlem tamamlandığında burada bilgi görünecek."
      />
    )
  }
  return (
    <table className="w-full min-w-[760px] border-collapse">
      <thead>
        <tr className="border-b border-border">
          <Th>Tarih</Th>
          <Th>Sözleşme</Th>
          <Th>Kaynak</Th>
          <Th right>Brüt Tutar</Th>
          <Th right>Net Tutar</Th>
          <Th>Serbest Tarihi</Th>
          <Th right>Durum</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((a) => (
          <tr key={a?.id} className="border-b border-border/60 last:border-0 hover:bg-elevated/40">
            <Td className="text-secondary-foreground">{formatDateTime(a?.calculatedAt)}</Td>
            <Td className="text-bright">{a?.contractNumber ?? '-'}</Td>
            <Td className="font-sans text-secondary-foreground">{a?.sourceType ?? '-'}</Td>
            <Td right className="text-secondary-foreground"><UsdtAmount value={formatUSDT(a?.grossAmount)} /></Td>
            <Td right className="font-semibold text-foreground"><UsdtAmount value={formatUSDT(a?.netAmount)} /></Td>
            <Td className="text-secondary-foreground">{formatDateTime(a?.releaseAt)}</Td>
            <td className="px-4 py-2.5 text-right">
              <StatusPill tone={accrualTone(String(a?.status))}>
                {a?.status ?? '-'}
              </StatusPill>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function OperationsTable({ operations }: { operations: Operation[] }) {
  const rows = Array.isArray(operations) ? operations : []
  if (rows.length === 0) {
    return <EmptyState icon={<Inbox className="size-5" />} />
  }
  return (
    <table className="w-full min-w-[560px] border-collapse">
      <thead>
        <tr className="border-b border-border">
          <Th>Tarih/Saat</Th>
          <Th>Operasyon</Th>
          <Th right>Hacim</Th>
          <Th right>Havuz</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((o) => {
          const amount = safeNumber(o?.amount)
          const positive = ['Yatırım', 'Yeniden yatırım', 'Tahakkuk'].includes(
            String(o?.operationType),
          )
          return (
            <tr key={o?.id} className="border-b border-border/60 last:border-0 hover:bg-elevated/40">
              <Td className="text-secondary-foreground">{formatDateTime(o?.createdAt)}</Td>
              <Td className="font-sans">{o?.operationType ?? '-'}</Td>
              <Td right className={positive ? 'font-semibold text-light-cyan' : 'text-foreground'}>
                {positive ? '+' : ''}
                <UsdtAmount value={formatUSDT(amount)} />
              </Td>
              <Td right className="font-sans text-secondary-foreground">{o?.poolName ?? '-'}</Td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
