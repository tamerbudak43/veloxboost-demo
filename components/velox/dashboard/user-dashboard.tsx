'use client'

import { ArrowUpRight, CircleDollarSign, MapPin, Network, TrendingUp, UserPlus, UsersRound, WalletCards } from 'lucide-react'
import { Panel, PanelHeader, StatTile, StatusPill } from '@/components/velox/primitives'
import { useLanguage } from '@/components/velox/language-context'
import { formatUSDT, safeNumber } from '@/lib/format'
import type { AwaitedReturn } from './user-dashboard.types'

export function UserDashboard({ data }: { data: AwaitedReturn }) {
  const { t, locale } = useLanguage()
  const maxGrowth = Math.max(1, ...data.growth.map((item) => item.registrations))
  const maxCountry = Math.max(1, ...data.countries.map((item) => item.members))
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-cyan">{t.userCenter}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{t.welcome}, {data.profile.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.dashboardIntro}</p>
        </div>
        <StatusPill tone="warning">{t.demoStatus}</StatusPill>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label={t.totalTeam} value={safeNumber(data.summary.totalNetwork)} hint={`${data.summary.directPartners} ${t.directPartner}`} accent />
        <StatTile label={t.latestDemoRegistrations} value={`+${data.todayRegistrations}`} hint={formatDate(data.latestDay, locale)} />
        <StatTile label={t.teamVolume} value={formatUSDT(data.summary.teamVolume, 2)} hint={t.allOpenDepths} />
        <StatTile label={t.currentCareer} value={data.profile.career} hint={`${data.summary.activePartners} ${t.activeDirectPartner}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <Panel>
          <PanelHeader title={t.incomeAreas} right={<CircleDollarSign className="size-4 text-cyan" />} />
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <Metric icon={UserPlus} label={t.referralIncome} value={formatUSDT(data.directCommission, 2)} tone="text-amber-300" />
            <Metric icon={Network} label={t.networkIncome} value={formatUSDT(data.networkIncome, 2)} tone="text-fuchsia-300" />
            <Metric icon={WalletCards} label={t.cashbackIndependent} value={formatUSDT(data.cashback, 2)} tone="text-emerald-300" />
            <Metric icon={TrendingUp} label={t.personalBalance} value={formatUSDT(data.profile.balance, 2)} tone="text-cyan" />
          </div>
          <p className="px-4 pb-4 text-xs leading-5 text-muted-foreground">{t.incomeNote}</p>
        </Panel>

        <Panel>
          <PanelHeader title={t.networkGrowth} right={<span className="text-xs text-muted-foreground">{t.lastRegistrationDays.replace('{count}', String(data.growth.length))}</span>} />
          <div className="flex min-h-56 items-end gap-3 px-5 pb-5 pt-8">
            {data.growth.map((item) => <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2"><span className="font-mono text-xs font-semibold text-cyan">+{item.registrations}</span><div className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400" style={{ height: `${Math.max(18, item.registrations / maxGrowth * 128)}px` }} /><span className="text-[10px] text-muted-foreground">{item.date.slice(5)}</span></div>)}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <Panel>
          <PanelHeader title={t.countryCityDistribution} right={<StatusPill tone="warning">{t.syntheticLocation}</StatusPill>} />
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div className="space-y-3">{data.countries.map((item) => <div key={item.code}><div className="flex justify-between gap-3 text-sm"><span className="text-secondary-foreground">{item.country}</span><span className="font-mono text-foreground">{item.members} {t.person}</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-elevated"><div className="h-full rounded-full velox-gradient" style={{ width: `${Math.max(5, item.members / maxCountry * 100)}%` }} /></div></div>)}</div>
            <div className="grid content-start gap-2">{data.cities.slice(0, 8).map((item) => <div key={`${item.code}-${item.city}`} className="flex items-center justify-between rounded-md border border-border bg-elevated px-3 py-2"><span className="flex items-center gap-2 text-sm text-secondary-foreground"><MapPin className="size-3.5 text-cyan" />{item.city}</span><span className="font-mono text-xs text-foreground">{item.members} · {formatUSDT(item.volume, 0)}</span></div>)}</div>
          </div>
          <p className="px-4 pb-4 text-xs text-amber-200">{t.locationPrivacyNote}</p>
        </Panel>

        <Panel>
          <PanelHeader title={t.recentTeamRegistrations} right={<UsersRound className="size-4 text-cyan" />} />
          {data.recentMembers.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground">{t.noTeamRecords}</div> : <div className="divide-y divide-border">{data.recentMembers.map((member) => <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><p className="font-semibold text-foreground">{member.name} <span className="font-mono text-xs text-muted-foreground">{member.veloxId}</span></p><p className="mt-1 text-xs text-muted-foreground">{member.level}. {t.depth} · {member.career} · {formatDate(member.joinedAt, locale)}</p></div><div className="text-end"><p className="font-mono text-sm font-semibold text-foreground">{formatUSDT(member.personalInvestment, 2)}</p><p className="text-xs text-muted-foreground">{t.investment}</p></div></div>)}</div>}
        </Panel>
      </div>

      <a href="/partners" className="group flex items-center justify-between rounded-lg border border-cyan/30 bg-cyan/10 px-5 py-4 text-sm font-semibold text-foreground transition hover:bg-cyan/15"><span>{t.inspectNetwork}</span><ArrowUpRight className="size-4 text-cyan transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>
    </div>
  )
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Network; label: string; value: string; tone: string }) { return <div className="rounded-lg border border-border bg-elevated p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-4 text-cyan" />{label}</div><p className={`mt-3 font-mono text-xl font-semibold ${tone}`}>{value}</p></div> }
function formatDate(value: string, locale: string) { const date = new Date(value.length === 10 ? `${value}T12:00:00` : value); return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date) }
