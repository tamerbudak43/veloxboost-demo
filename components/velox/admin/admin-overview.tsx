'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Users, ArrowUpRight, ArrowDownRight, Waves, TrendingUp, Clock, FileDown, BarChart3 } from 'lucide-react'
import { Panel, StatusPill } from '@/components/velox/primitives'
import { formatUSDT, formatNumber, percentOf, safeArray, safeNumber } from '@/lib/format'
import type { AdminKpi, WithdrawalRequest } from '@/lib/types'
import type { DemoCityReport, DemoDailyReport } from '@/lib/services/demo-report.service'

const COUNTRY_DOTS: Record<string, { x: number; y: number }> = {
  TR: { x: 59, y: 46 }, DE: { x: 51, y: 36 }, AZ: { x: 63, y: 44 }, KZ: { x: 69, y: 39 },
  AE: { x: 62, y: 54 }, RU: { x: 67, y: 27 }, UZ: { x: 66, y: 45 }, GE: { x: 61, y: 42 },
}
const COUNTRY_COLORS = ['#22d3ee', '#3b82f6', '#fbbf24', '#d946ef', '#34d399', '#fb7185', '#a78bfa', '#f97316']

function CountryWorldMap({ cities }: { cities?: DemoCityReport[] }) {
  const locationRows = cities ?? []
  const mapRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  useEffect(() => {
    if (!key || !mapRef.current) return
    const init = () => {
      const maps = (window as any).google?.maps
      if (!maps || !mapRef.current) return
      const map = new maps.Map(mapRef.current, { center: { lat: 42, lng: 42 }, zoom: 2, disableDefaultUI: true, zoomControl: true, styles: [
        { elementType: 'geometry', stylers: [{ color: '#0b1624' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#122238' }] },
        { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4c719d' }, { weight: 1.1 }, { visibility: 'on' }] },
        { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#294968' }, { visibility: 'on' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#06111e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#d9e7f6' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1624' }, { weight: 3 }] },
        { featureType: 'road', elementType: 'all', stylers: [{ visibility: 'off' }] },
      ] })
      locationRows.forEach((item, index) => { const circle = new maps.Circle({ map, center: { lat: item.lat, lng: item.lng }, radius: 95000 + item.members * 15000, strokeColor: COUNTRY_COLORS[index % COUNTRY_COLORS.length], strokeOpacity: 1, strokeWeight: 2, fillColor: COUNTRY_COLORS[index % COUNTRY_COLORS.length], fillOpacity: .72, clickable: true }); const info = new maps.InfoWindow({ content: `<div style="color:#10233a;font:500 13px Arial"><strong>${item.city}, ${item.country}</strong><br/>Demo üye: ${item.members}<br/>Demo hacim: ${formatUSDT(item.deposits, 0)}</div>` }); circle.addListener('click', () => info.setPosition(circle.getCenter())) ; circle.addListener('click', () => info.open({ map })) })
      setReady(true)
    }
    if ((window as any).google?.maps) { init(); return }
    const id = 'velox-google-maps-script'
    const existing = document.getElementById(id)
    if (existing) { existing.addEventListener('load', init); return () => existing.removeEventListener('load', init) }
    const script = document.createElement('script'); script.id = id; script.async = true; script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`; script.addEventListener('load', init); document.head.appendChild(script)
  }, [locationRows, key])
  const max = Math.max(...locationRows.map((item) => item.deposits), 1)
  return <div className="rounded-lg border border-border bg-surface p-4">
    <div className="flex items-center justify-between"><h3 className="text-sm font-medium">Demo kayıt ülkeleri</h3><span className="text-[10px] text-amber-200">Sentetik konumlar</span></div>
    {key ? <div ref={mapRef} className="mt-3 h-64 overflow-hidden rounded-md border border-border" aria-label="Demo ülke dağılımı Google haritası" /> : <svg viewBox="0 0 100 62" className="mt-3 w-full" role="img" aria-label="Demo ülke dağılımı dünya haritası">
      <path d="M5 18l10-7 12 2 5 8-5 7-12 1-7 7-5-5 3-8zM32 10l8 3 3 8-4 6-5-4zM44 15l15-5 14 3 10 8-3 6-10 1-5 7-12-3-7-8zM58 36l9 2 6 11-5 10-7-4-4-10zM78 40l11 3 7 8-4 7-10-2-6-8z" fill="currentColor" className="text-background" stroke="currentColor" strokeWidth=".7" opacity=".95" />
      <path d="M5 18l10-7 12 2 5 8-5 7-12 1-7 7-5-5 3-8zM32 10l8 3 3 8-4 6-5-4zM44 15l15-5 14 3 10 8-3 6-10 1-5 7-12-3-7-8zM58 36l9 2 6 11-5 10-7-4-4-10zM78 40l11 3 7 8-4 7-10-2-6-8z" fill="none" stroke="#1e3a5f" strokeWidth=".5" />
      {locationRows.map((item, index) => {
        const point = COUNTRY_DOTS[item.code]
        if (!point) return null
        return <g key={item.code}><circle cx={point.x} cy={point.y} r={2 + (item.deposits / max) * 2.4} fill={COUNTRY_COLORS[index % COUNTRY_COLORS.length]} opacity=".88" /><text x={point.x + 2.5} y={point.y - 2} fill="#e5eefc" fontSize="3">{item.code}</text></g>
      })}
    </svg>}
    {key && !ready ? <p className="mt-2 text-[11px] text-muted-foreground">Google haritası yükleniyor…</p> : null}
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">{locationRows.map((item, index) => <div key={`${item.code}-${item.city}`} className="flex items-center justify-between gap-2"><span className="flex min-w-0 items-center gap-1.5 text-muted-foreground"><i className="size-2 shrink-0 rounded-full" style={{ backgroundColor: COUNTRY_COLORS[index % COUNTRY_COLORS.length] }} />{item.city}, {item.country}</span><span className="font-mono text-foreground">{item.members} · {formatUSDT(item.deposits, 0)}</span></div>)}</div>
  </div>
}

function DistributionDonut({ current }: { current?: DemoDailyReport }) {
  const values = [current?.memberAccrual ?? 0, current?.referralExpense ?? 0, current?.networkIncome ?? 0, current?.cashback ?? 0, current?.automaticPayments ?? 0]
  const labels = ['Yatırım kârı', 'Referral %6', 'Network', 'Cashback', 'Otomatik çekim']
  const colors = ['#22d3ee', '#fbbf24', '#e879f9', '#34d399', '#3b82f6']
  const total = Math.max(values.reduce((sum, value) => sum + value, 0), 1)
  let cursor = 0
  const segments = values.map((value, index) => { const start = cursor; cursor += (value / total) * 100; return `${colors[index]} ${start}% ${cursor}%` })
  return <div className="rounded-lg border border-border bg-surface p-4">
    <h3 className="text-sm font-medium">Bugünkü dağılım</h3>
    <div className="mt-3 flex items-center gap-5"><div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${segments.join(', ')})` }}><div className="grid size-20 place-items-center rounded-full bg-surface text-center"><span className="text-[10px] text-muted-foreground">Toplam</span><span className="font-mono text-xs font-semibold">{formatUSDT(total, 0)}</span></div></div><div className="space-y-2 text-[11px]">{labels.map((label, index) => <div key={label} className="flex items-center justify-between gap-5"><span className="flex items-center gap-1.5 text-muted-foreground"><i className="size-2 rounded-full" style={{ backgroundColor: colors[index] }} />{label}</span><span className="font-mono text-foreground">{formatUSDT(values[index], 2)}</span></div>)}</div></div>
  </div>
}

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

function DemoReportOverview({ daily, cities, endingCash }: { daily: DemoDailyReport[]; cities: DemoCityReport[]; endingCash: number }) {
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

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Kasa açılış</p><p className="mt-1 font-mono text-lg font-semibold">{formatUSDT(current?.openingCash ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Bugün giriş</p><p className="mt-1 font-mono text-lg font-semibold">{formatUSDT(current?.deposits ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Yatırım kâr dağıtımı</p><p className="mt-1 font-mono text-lg font-semibold text-light-cyan">{formatUSDT(current?.memberAccrual ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Referral %6</p><p className="mt-1 font-mono text-lg font-semibold text-amber-300">{formatUSDT(current?.referralExpense ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Network geliri</p><p className="mt-1 font-mono text-lg font-semibold text-fuchsia-300">{formatUSDT(current?.networkIncome ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Cashback</p><p className="mt-1 font-mono text-lg font-semibold text-emerald-300">{formatUSDT(current?.cashback ?? 0, 2)}</p></div>
        <div className="rounded-lg bg-surface p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Otomatik çekim</p><p className="mt-1 font-mono text-lg font-semibold text-electric">{formatUSDT(current?.automaticPayments ?? 0, 2)}</p></div>
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
      <div className="grid gap-4 border-t border-border/60 p-4 lg:grid-cols-2"><DistributionDonut current={current} /><CountryWorldMap cities={cities} /></div>
    </Panel>
  )
}

export function AdminOverview({ kpi, withdrawals, demoReports }: { kpi: AdminKpi; withdrawals: WithdrawalRequest[]; demoReports: { daily: DemoDailyReport[]; cities: DemoCityReport[]; endingCash: number } }) {
  const queue = safeArray<WithdrawalRequest>(withdrawals)
    .filter((w) => w?.status === 'pending')
    .slice(0, 4)

  const latestDemo = demoReports.daily.at(-1)
  const demoTotals = demoReports.daily.reduce((total, row) => ({
    deposits: total.deposits + row.deposits,
    withdrawals: total.withdrawals + row.automaticPayments,
  }), { deposits: 0, withdrawals: 0 })
  const hasDemoFinance = demoReports.daily.length > 0
  const totalDeposits = hasDemoFinance ? demoTotals.deposits : kpi.totalDeposits
  const totalWithdrawals = hasDemoFinance ? demoTotals.withdrawals : kpi.totalWithdrawals
  const dailyVolume = hasDemoFinance ? latestDemo?.deposits ?? 0 : kpi.dailyVolume
  const poolBalance = hasDemoFinance ? demoReports.endingCash : kpi.poolBalance
  const utilization = percentOf(totalWithdrawals, totalDeposits)

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
          value={formatUSDT(dailyVolume, 0)}
          hint={hasDemoFinance ? 'Demo gün sonu girişi' : 'Son 24 saat'}
          icon={TrendingUp}
          tone="up"
        />
        <KpiCard
          label="Havuz bakiyesi"
          value={formatUSDT(poolBalance, 0)}
          hint={`${formatNumber(utilization, 1)}% kullanım`}
          icon={Waves}
        />
        <KpiCard
          label={hasDemoFinance ? 'Ödeme kuyruğu' : 'Bekleyen çekim'}
          value={hasDemoFinance ? formatUSDT(latestDemo?.paymentQueue ?? 0, 0) : formatNumber(kpi.pendingWithdrawals, 0)}
          hint={hasDemoFinance ? 'Demo tahakkuk bakiyesi' : 'Onay bekliyor'}
          icon={Clock}
          tone="down"
        />
      </div>

      <DemoReportOverview daily={demoReports.daily} cities={demoReports.cities} endingCash={demoReports.endingCash} />

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
                <span className="font-mono tabular-nums">{formatUSDT(totalDeposits, 0)}</span>
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
                <span className="font-mono tabular-nums">{formatUSDT(totalWithdrawals, 0)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="velox-gradient h-full rounded-full"
                  style={{ width: `${percentOf(totalWithdrawals, totalDeposits)}%` }}
                />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="text-xs text-muted-foreground">Net platform akışı</div>
              <div className="mt-1 font-mono text-lg font-semibold text-light-cyan tabular-nums">
                +{formatUSDT(totalDeposits - totalWithdrawals, 0)}
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
