'use client'

import Link from 'next/link'
import { Users, ArrowUpRight, ArrowDownRight, Waves, TrendingUp, Clock } from 'lucide-react'
import { Panel, StatusPill } from '@/components/velox/primitives'
import { formatUSDT, formatNumber, percentOf, safeArray, safeNumber } from '@/lib/format'
import type { AdminKpi, WithdrawalRequest } from '@/lib/types'

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

export function AdminOverview({ kpi, withdrawals }: { kpi: AdminKpi; withdrawals: WithdrawalRequest[] }) {
  const trend = [] as { day: number; value: number }[]
  const trendMax = Math.max(...trend.map((t) => safeNumber(t.value)), 1)
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Volume trend */}
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">30 günlük hacim</h2>
            <StatusPill tone="success">Canlı</StatusPill>
          </div>
          <div className="mt-5 flex h-48 items-stretch gap-1">
            {trend.map((t) => (
              <div key={t.day} className="flex flex-1 flex-col justify-end" title={formatUSDT(t.value, 0)}>
                <div
                  className="velox-gradient w-full rounded-t transition-all"
                  style={{ height: `${Math.max(4, percentOf(t.value, trendMax))}%` }}
                />
              </div>
            ))}
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
