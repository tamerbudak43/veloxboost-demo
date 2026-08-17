'use client'

import {
  TrendingUp,
  Wallet,
  Layers,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
} from 'lucide-react'
import {
  PageHeader,
  Panel,
  PanelHeader,
  StatTile,
  Eyebrow,
} from '@/components/velox/primitives'
import { formatUSDT, formatPercent, safeNumber, percentOf } from '@/lib/format'
import {
  demoBalance,
  demoContracts,
  demoNetwork,
  demoTrades,
  demoAccruals,
} from '@/lib/demo-data'

/** Simple, safe horizontal bar (presentational only). */
function Bar({ label, value, max, tone = 'gradient' }: { label: string; value: number; max: number; tone?: 'gradient' | 'muted' }) {
  const pct = percentOf(value, max)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">{formatUSDT(value, 2)}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={tone === 'gradient' ? 'velox-gradient h-full rounded-full' : 'h-full rounded-full bg-muted-foreground/40'}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  )
}

export function StatisticsView() {
  const trades = demoTrades
  const contracts = demoContracts
  const accruals = demoAccruals

  const arbitrageProfit = trades.reduce((s, t) => s + safeNumber(t.netSpread), 0)
  const networkEarnings = safeNumber(demoNetwork.networkEarnings)
  const accrualTotal = accruals.reduce((s, a) => s + safeNumber(a.netAmount), 0)
  const totalEarnings = arbitrageProfit + networkEarnings + accrualTotal

  const totalInvested = contracts.reduce((s, c) => s + safeNumber(c.initialAmount), 0)
  const totalPaid = contracts.reduce((s, c) => s + safeNumber(c.totalPaid), 0)
  const roi = percentOf(totalPaid - totalInvested, totalInvested)

  const breakdownMax = Math.max(arbitrageProfit, networkEarnings, accrualTotal, 1)

  // 6-period synthetic earnings trend derived from stable demo values (presentational).
  const trend = [0.42, 0.58, 0.51, 0.73, 0.66, 0.9].map((w, i) => ({
    label: `P${i + 1}`,
    value: totalEarnings * w,
  }))
  const trendMax = Math.max(...trend.map((t) => t.value), 1)

  return (
    <div>
      <PageHeader
        title="Yatırımcı İstatistikleri"
        description="Toplam kazanç, arbitraj performansı, ağ geliri ve yatırım getirinizin özeti."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Toplam kazanç" value={formatUSDT(totalEarnings)} accent hint="Tüm kaynaklar" />
        <StatTile label="Ticaret bakiyesi" value={formatUSDT(demoBalance.tradingBalance)} />
        <StatTile label="Gelir bakiyesi" value={formatUSDT(demoBalance.incomeBalance)} />
        <StatTile
          label="Yatırım getirisi (ROI)"
          value={formatPercent(roi)}
          hint={`${formatUSDT(totalInvested, 2)} yatırıldı`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel>
          <PanelHeader title="Kazanç dağılımı" right={<Eyebrow>USDT</Eyebrow>} />
          <div className="flex flex-col gap-4 p-4">
            <Bar label="Arbitraj kârı" value={arbitrageProfit} max={breakdownMax} />
            <Bar label="Ağ komisyonu" value={networkEarnings} max={breakdownMax} />
            <Bar label="Tahakkuk (net)" value={accrualTotal} max={breakdownMax} tone="muted" />
          </div>
          <div className="grid grid-cols-3 gap-px border-t border-border bg-border">
            <MiniStat icon={<Layers className="size-3.5" />} label="Arbitraj" value={formatUSDT(arbitrageProfit, 2)} />
            <MiniStat icon={<Users className="size-3.5" />} label="Ağ" value={formatUSDT(networkEarnings, 2)} />
            <MiniStat icon={<PiggyBank className="size-3.5" />} label="Tahakkuk" value={formatUSDT(accrualTotal, 2)} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Dönemsel kazanç eğilimi" right={<Eyebrow>Son 6 dönem</Eyebrow>} />
          <div className="flex h-[188px] items-stretch gap-2 p-4">
            {trend.map((t) => (
              <div key={t.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex-1 w-full">
                  <div
                    className="velox-gradient absolute inset-x-0 bottom-0 rounded-t-md transition-all"
                    style={{ height: `${Math.max(4, percentOf(t.value, trendMax))}%` }}
                    title={formatUSDT(t.value, 2)}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Panel className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4" />
            <span className="text-xs uppercase tracking-[0.1em]">Arbitraj işlemleri</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{trades.length}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-light-cyan">
            <ArrowUpRight className="size-3.5" />
            {formatUSDT(arbitrageProfit, 2)} net kâr
          </p>
        </Panel>
        <Panel className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="size-4" />
            <span className="text-xs uppercase tracking-[0.1em]">Toplam ödenen (1:3)</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{formatUSDT(totalPaid, 2)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {formatUSDT(totalInvested, 2)} yatırım
          </p>
        </Panel>
        <Panel className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-xs uppercase tracking-[0.1em]">Ağ büyüklüğü</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{safeNumber(demoNetwork.totalNetwork)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-light-cyan">
            <ArrowUpRight className="size-3.5" />
            {safeNumber(demoNetwork.activePartners)} aktif ortak
          </p>
        </Panel>
      </div>
    </div>
  )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-card px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-mono text-sm font-medium tabular-nums text-foreground">{value}</div>
    </div>
  )
}
