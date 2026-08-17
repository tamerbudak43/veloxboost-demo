'use client'

import Link from 'next/link'
import { Users, ArrowUpRight, ArrowDownRight, Waves, TrendingUp, Clock, FileDown, BarChart3 } from 'lucide-react'
import { Panel, StatusPill } from '@/components/velox/primitives'
import { formatUSDT, formatNumber, percentOf, safeArray, safeNumber } from '@/lib/format'
import type { AdminKpi, WithdrawalRequest } from '@/lib/types'
import type { DemoDailyReport } from '@/lib/services/demo-report.service'

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'up' | 'down'
}) {
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">{value}</div>
          {hint ? (
            <div
              className={`mt-1 flex items-center gap-1 text-xs ${
                tone === 'up' ? 'text-light-cyan' : tone === 'down' ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {tone === 'up' ? <ArrowUpRight className="size-3.5" /> : null}
              {tone === 'down' ? <ArrowDownRight className="size-3.5" /> : null}
              {hint}
            </div>
          ) : null}
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-surface text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </Panel>
  )
}

function DemoReportOverview({ daily, endingCash }: { daily: DemoDailyReport[]; endingCash: number }) {
  const current = daily.at(-1)
  const chartMax = Math.max(...daily.flatMap((row) => [row.deposits, row.memberAccrual, row.referralExpense, row.networkIncome]), 1)

  return (
    <Panel className="border-cyan/30 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <div className="flex items-center gap-2"><BarChart3 className="size-4 text-cyan" /><h2 className="font-semibold">Faz 1 demo · gün sonu özeti</h2></div>
          <p className="mt-1 text-xs text-muted-foreground">Yalnızca simülasyon defteri; gerçek ödeme veya cüzdan hareketi oluşturmaz.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/api/admin/demo-reports/finance" className="inline-flex items-center gap-1.5 rounded-md border border-cyan/50 px-2.5 py-1.5 text-xs font-medium text-cyan hover:bg-cyan/10"><FileDown className="size-3.5" /> Finans PDF</a>
          <a href="/api/admin/demo-reports/finance?format=excel" className="inline-flex items-center gap-1.5 rounded-md border border-cyan/50 px-2.5 py-1.5 text-xs font-medium text-cyan hover:bg-cyan/10"><FileDown className="size-3.5" /> Finans Excel</a>
          <a href="/api/admin/demo-reports/growth" className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-cyan/50 hover:text-foreground"><FileDown className="size-3.5" /> Ağ PDF</a>
          <a href="/api/admin/demo-reports/growth?format=excel" className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-cyan/50 hover:text-foreground"><FileDown className="size-3.5" /> Ağ Excel</a>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Bugün giriş</p><p className="mt-1 font-mono text-lg font-semibold">{formatUSDT(current?.deposits ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Yatırım kâr dağıtımı</p><p className="mt-1 font-mono text-lg font-semibold text-light-cyan">{formatUSDT(current?.memberAccrual ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Referral %6</p><p className="mt-1 font-mono text-lg font-semibold text-amber-300">{formatUSDT(current?.referralExpense ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Network geliri</p><p className="mt-1 font-mono text-lg font-semibold text-fuchsia-300">{formatUSDT(current?.networkIncome ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Net gün K/Z</p><p className="mt-1 font-mono text-lg font-semibold text-light-cyan">{formatUSDT(current?.profitLoss ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Kasa devir</p><p className="mt-1 font-mono text-lg font-semibold">{formatUSDT(endingCash, 2)}</p></div>
      </div>

      <div className="grid gap-4 border-t border-border/60 p-4 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-medium">Günlük finans dağılımı</h3><span className="text-[11px] text-muted-foreground">USDT · son {daily.length} gün</span></div>
          {daily.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">Demo henüz çalıştırılmadı.</div> : <div className="flex h-36 items-end gap-2">{daily.map((row) => <div key={row.date} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={`${row.date}: yatırım dağıtımı ${formatUSDT(row.memberAccrual, 2)} · referral ${formatUSDT(row.referralExpense, 2)} · network ${formatUSDT(row.networkIncome, 2)}`}><div className="flex h-28 w-full items-end justify-center gap-0.5"><div className="w-2 rounded-t bg-cyan" style={{ height: `${Math.max(3, percentOf(row.deposits, chartMax))}%` }} /><div className="w-2 rounded-t bg-electric" style={{ height: `${Math.max(3, percentOf(row.memberAccrual, chartMax))}%` }} /><div className="w-2 rounded-t bg-amber-400" style={{ height: `${Math.max(3, percentOf(row.referralExpense, chartMax))}%` }} /><div className="w-2 rounded-t bg-fuchsia-400" style={{ height: `${Math.max(3, percentOf(row.networkIncome, chartMax))}%` }} /></div><span className="text-[9px] text-muted-foreground">{row.date.slice(5)}</span></div>)}</div>}
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground"><span><i className="mr-1 inline-block size-2 rounded-sm bg-cyan" />Giriş</span><span><i className="mr-1 inline-block size-2 rounded-sm bg-electric" />Yatırım kârı</span><span><i className="mr-1 inline-block size-2 rounded-sm bg-amber-400" />Referral %6</span><span><i className="mr-1 inline-block size-2 rounded-sm bg-fuchsia-400" />Network</span></div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4"><h3 className="text-sm font-medium">Ağ büyüme hızı</h3><div className="mt-4 space-y-3">{daily.map((row, index) => { const previous = daily[index - 1]?.cumulativeMembers ?? 0; const growth = previous ? ((row.cumulativeMembers - previous) / previous) * 100 : 0; return <div key={row.date} className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{row.date}</span><span>{row.registrations} yeni · {row.cumulativeMembers} ağ</span><span className="font-mono text-light-cyan">{index === 0 ? 'Başlangıç' : `%${formatNumber(growth, 1)}`}</span></div> })}</div></div>
      </div>
    </Panel>
  )
}

export function AdminOverview({ kpi, withdrawals, demoReports }: { kpi: AdminKpi; withdrawals: WithdrawalRequest[]; demoReports: { daily: DemoDailyReport[]; endingCash: number } }) {
  const queue = safeArray<WithdrawalRequest>(withdrawals)
    .filter((w) => w?.status === 'pending')
    .slice(0, 4)

  const utilization = percentOf(kpi.totalWithdrawals, kpi.totalDeposits)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Genel Bakış</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Platform sağlığı, hacim ve bekleyen operasyonların anlık görünümü.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Toplam kullanıcı"
          value={formatNumber(kpi.totalUsers, 0)}
          hint={`${formatNumber(kpi.activeUsers, 0)} aktif`}
          icon={Users}
          tone="up"
        />
        <KpiCard
          label="Günlük hacim"
          value={formatUSDT(kpi.dailyVolume, 0)}
          hint="Son 24 saat"
          icon={TrendingUp}
          tone="up"
        />
        <KpiCard
          label="Havuz bakiyesi"
          value={formatUSDT(kpi.poolBalance, 0)}
          hint={`${formatNumber(utilization, 1)}% kullanım`}
          icon={Waves}
        />
        <KpiCard
          label="Bekleyen çekim"
          value={formatNumber(kpi.pendingWithdrawals, 0)}
          hint="Onay bekliyor"
          icon={Clock}
          tone="down"
        />
      </div>

      <DemoReportOverview daily={demoReports.daily} endingCash={demoReports.endingCash} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Volume trend */}
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">30 günlük hacim</h2>
            <StatusPill tone="success">Canlı</StatusPill>
          </div>
          <div className="mt-5 flex h-48 items-stretch gap-1">
            <div className="m-auto text-sm text-muted-foreground">Operasyon hacmi, demo raporları bölümünde gün gün gösterilir.</div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>30 gün önce</span>
            <span>Bugün</span>
          </div>
        </Panel>

        {/* Deposit vs withdrawal */}
        <Panel>
          <h2 className="font-semibold">Para akışı</h2>
          <div className="mt-5 space-y-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ArrowUpRight className="size-4 text-light-cyan" /> Yatırım
                </span>
                <span className="font-mono tabular-nums">{formatUSDT(kpi.totalDeposits, 0)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-cyan" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ArrowDownRight className="size-4 text-electric" /> Çekim
                </span>
                <span className="font-mono tabular-nums">{formatUSDT(kpi.totalWithdrawals, 0)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="velox-gradient h-full rounded-full"
                  style={{ width: `${percentOf(kpi.totalWithdrawals, kpi.totalDeposits)}%` }}
                />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="text-xs text-muted-foreground">Net platform akışı</div>
              <div className="mt-1 font-mono text-lg font-semibold text-light-cyan tabular-nums">
                +{formatUSDT(kpi.totalDeposits - kpi.totalWithdrawals, 0)}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Pending withdrawals preview */}
      <Panel className="p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="font-semibold">Bekleyen çekim onayları</h2>
          <Link href="/admin/withdrawals" className="text-xs font-medium text-primary hover:underline">
            Tümünü gör
          </Link>
        </div>
        {queue.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Bekleyen çekim talebi yok.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {queue.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{w.userName}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{w.veloxId}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold tabular-nums">
                    {formatUSDT(w.amount, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">{w.network}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
