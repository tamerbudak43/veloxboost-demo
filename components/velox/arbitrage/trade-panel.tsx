'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber, formatUSDT, safeNumber } from '@/lib/format'
import type { MarketOffer } from '@/lib/types'
import { cn } from '@/lib/utils'
import { UsdtAmount, UsdtLabel } from '@/components/velox/tether-icon'

interface TradePanelProps {
  side: 'buy' | 'sell'
  exchange: string
  myAsset: number
  totalPool: number
  offers: MarketOffer[]
  /** Incremented by the visual simulator. Never represents an actual order. */
  simulationTick?: number
}

export function TradePanel({ side, exchange, myAsset, totalPool, offers, simulationTick = 0 }: TradePanelProps) {
  const isBuy = side === 'buy'
  const title = isBuy ? 'Satın Al' : 'Sat'
  const actionLabel = isBuy ? 'Satın al' : 'Sat'
  const safeOffers = Array.isArray(offers) ? offers : []
  const openDemo = () => {
    const params = new URLSearchParams({
      exchange,
      side,
      price: String(safeOffers[0]?.ethPrice ?? 2400),
    })
    window.open(`/market-demo?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  const totalEth = safeOffers.reduce((acc, o) => acc + safeNumber(o?.ethVolume), 0)
  const totalUsdt = safeOffers.reduce((acc, o) => acc + safeNumber(o?.usdtVolume), 0)

  const cols = isBuy
    ? [<UsdtLabel key="usdt" />, 'ETH ALIŞ FİYATI', 'ETH HACMİ']
    : ['ETH HACMİ', 'ETH SATIŞ FİYATI', <UsdtLabel key="usdt" />]

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'size-2 rounded-full',
              isBuy ? 'bg-cyan' : 'bg-destructive',
            )}
          />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <button onClick={openDemo} className="inline-flex items-center gap-1 rounded-md border border-border bg-elevated px-2 py-0.5 text-[11px] font-semibold tracking-wide text-bright transition-colors hover:border-cyan/60 hover:text-cyan" aria-label={`${exchange} piyasa demosunu aç`}>
          {exchange}
          <ExternalLink className="size-3 text-muted-foreground" />
        </button>
      </div>

      {/* Info rows */}
      <div className="grid grid-cols-3 gap-px border-b border-border bg-border text-center">
        <InfoCell label="Varlığım" value={<UsdtAmount value={formatUSDT(myAsset, 2)} />} />
        <InfoCell label="Toplam havuz" value={<UsdtAmount value={formatUSDT(totalPool, 3)} />} />
        <div className="flex flex-col items-center justify-center bg-card px-2 py-2.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Canlı yayın (VELOX)
          </span>
          <button onClick={openDemo} className="mt-0.5 text-xs font-medium text-bright hover:underline">
            Görüntüle →
          </button>
        </div>
      </div>

      {/* Order table */}
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-light-cyan">
          Best Offer
        </span>
        <Button
          size="xs"
          className={cn(
            'text-primary-foreground',
            isBuy ? 'velox-gradient' : 'bg-destructive/80 hover:bg-destructive',
          )}
        >
          {actionLabel}
        </Button>
      </div>

      <div className="px-2 pb-2">
        <div className="grid grid-cols-3 gap-2 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {cols.map((c, index) => (
            <span key={index} className="last:text-right">
              {c}
            </span>
          ))}
        </div>
        <div className="space-y-px">
          {safeOffers.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              Teklif bekleniyor...
            </p>
          ) : (
            safeOffers.map((o, i) => (
              <div
                key={o?.id ?? i}
                className={cn(
                  'grid grid-cols-3 gap-2 rounded-md px-2 py-1.5 font-mono text-xs tabular-nums transition-colors hover:bg-elevated',
                  i === 0 && 'bg-elevated/60',
                )}
                style={{
                  animationName: simulationTick > 0 ? 'velox-market-flash' : undefined,
                  animationDuration: simulationTick > 0 ? '650ms' : undefined,
                  animationTimingFunction: simulationTick > 0 ? 'ease-out' : undefined,
                  animationFillMode: simulationTick > 0 ? 'both' : undefined,
                  animationDelay: `${i * 45}ms`,
                }}
              >
                {isBuy ? (
                  <>
                    <span className="text-foreground">{formatNumber(o?.usdtVolume, 2)}</span>
                    <span className="text-bright">{formatNumber(o?.ethPrice, 2)}</span>
                    <span className="text-right text-secondary-foreground">
                      {formatNumber(o?.ethVolume, 4)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-secondary-foreground">{formatNumber(o?.ethVolume, 4)}</span>
                    <span className="text-bright">{formatNumber(o?.ethPrice, 2)}</span>
                    <span className="text-right text-foreground">{formatNumber(o?.usdtVolume, 2)}</span>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active trade label */}
      <div className="flex items-center justify-between border-t border-border px-4 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Aktif İşlem</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-cyan">
          <span className="size-1.5 animate-pulse rounded-full bg-cyan" />
          Simülasyonda eşleştiriliyor
        </span>
      </div>

      {/* Total */}
      <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-2.5">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {isBuy ? 'Toplam hacim ETH' : <UsdtLabel />}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {isBuy ? formatNumber(totalEth, 4) : <UsdtAmount value={formatUSDT(totalUsdt, 2)} />}
        </span>
      </div>
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center bg-card px-2 py-2.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  )
}
