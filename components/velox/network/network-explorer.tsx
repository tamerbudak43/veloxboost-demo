'use client'

import { useMemo, useState } from 'react'
import {
  Award,
  GitBranch,
  Layers,
  List,
  Lock,
  Network,
  Search,
  TrendingUp,
  Unlock,
  Users,
  Zap,
} from 'lucide-react'
import {
  Eyebrow,
  Panel,
  PanelHeader,
  ProgressBar,
  StatTile,
  StatusPill,
} from '@/components/velox/primitives'
import { DataTable, type Column } from '@/components/velox/data-table'
import { ReferralCard } from '@/components/velox/network/referral-card'
import { PartnerAvatar } from '@/components/velox/network/partner-avatar'
import { SponsorTree } from '@/components/velox/network/sponsor-tree'
import { formatUSDT, formatDate, formatPercent, safeArray, safeNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { NetworkListRow } from '@/lib/services/network.service'
import type {
  CareerProgress,
  CommissionRow,
  DepthRow,
  LegSummary,
  NetworkSummary,
  SponsorTreeNode,
} from '@/lib/network/types'

type Tab = 'tree' | 'list' | 'depth' | 'legs'

const statusMeta: Record<string, { tone: 'success' | 'active' | 'neutral'; label: string }> = {
  qualified: { tone: 'success', label: 'Nitelikli' },
  active: { tone: 'active', label: 'Aktif' },
  inactive: { tone: 'neutral', label: 'Pasif' },
}

const earningStatusMeta: Record<CommissionRow['status'], 'success' | 'active' | 'warning' | 'neutral'> = {
  Paid: 'success',
  Approved: 'active',
  Qualified: 'active',
  Pending: 'warning',
  Rejected: 'neutral',
}

export interface NetworkExplorerProps {
  referralCode: string
  summary: NetworkSummary
  tree: SponsorTreeNode | null
  legs: LegSummary[]
  depthRows: DepthRow[]
  memberList: NetworkListRow[]
  earnings: CommissionRow[]
  totalEarnings: number
  careerProgress: CareerProgress
  unlockedDepth: number
}

const TABS: { key: Tab; label: string; icon: typeof Network }[] = [
  { key: 'tree', label: 'Ağaç', icon: Network },
  { key: 'list', label: 'Liste', icon: List },
  { key: 'depth', label: 'Derinlik', icon: Layers },
  { key: 'legs', label: 'Bacaklar', icon: GitBranch },
]

export function NetworkExplorer(props: NetworkExplorerProps) {
  const { summary, careerProgress } = props
  const [tab, setTab] = useState<Tab>('tree')
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all')

  const members = safeArray<NetworkListRow>(props.memberList)
  const levels = useMemo(
    () => Array.from(new Set(members.map((m) => m.level))).sort((a, b) => a - b),
    [members],
  )

  const filtered = members.filter((m) => {
    const q = query.trim().toLowerCase()
    const matchQuery = q === '' || m.name.toLowerCase().includes(q) || m.veloxId.toLowerCase().includes(q)
    const matchLevel = levelFilter === 'all' || m.level === levelFilter
    return matchQuery && matchLevel
  })

  const listColumns: Column<NetworkListRow>[] = [
    {
      key: 'partner',
      header: 'Ortak',
      cell: (p) => (
        <div className="flex items-center gap-2.5">
          <PartnerAvatar name={p.name} seed={p.veloxId} />
          <div>
            <div className="font-medium text-foreground">{p.name}</div>
            <div className="font-mono text-[11px] text-muted-foreground">{p.veloxId}</div>
          </div>
        </div>
      ),
    },
    { key: 'level', header: 'Seviye', align: 'center', cell: (p) => <span className="font-mono text-foreground">L{p.level}</span> },
    { key: 'career', header: 'Kariyer', cell: (p) => <span className="text-xs">{p.career}</span> },
    { key: 'pv', header: 'Kişisel hacim', align: 'right', cell: (p) => <span className="font-mono tabular-nums">{formatUSDT(p.personalVolume, 0)}</span> },
    { key: 'tv', header: 'Ekip hacmi', align: 'right', cell: (p) => <span className="font-mono tabular-nums text-foreground">{formatUSDT(p.teamVolume, 0)}</span> },
    { key: 'status', header: 'Durum', align: 'center', cell: (p) => <StatusPill tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</StatusPill> },
    { key: 'joined', header: 'Katılım', align: 'right', cell: (p) => formatDate(p.joinedAt) },
  ]

  const depthColumns: Column<DepthRow>[] = [
    { key: 'level', header: 'Seviye', cell: (d) => <span className="font-mono text-foreground">L{d.level}</span> },
    { key: 'members', header: 'Üye', align: 'right', cell: (d) => <span className="font-mono tabular-nums">{safeNumber(d.members)}</span> },
    { key: 'active', header: 'Aktif', align: 'right', cell: (d) => <span className="font-mono tabular-nums">{safeNumber(d.active)}</span> },
    { key: 'qualified', header: 'Nitelikli', align: 'right', cell: (d) => <span className="font-mono tabular-nums">{safeNumber(d.qualified)}</span> },
    { key: 'volume', header: 'Hacim', align: 'right', cell: (d) => <span className="font-mono tabular-nums text-foreground">{formatUSDT(d.volume, 0)}</span> },
    { key: 'rate', header: 'Oran', align: 'right', cell: (d) => <span className="font-mono tabular-nums">{formatPercent(d.commissionRate, 1)}</span> },
    {
      key: 'unlocked',
      header: 'Durum',
      align: 'center',
      cell: (d) =>
        d.unlocked ? (
          <StatusPill tone="success"><Unlock className="size-3" /> Açık</StatusPill>
        ) : (
          <StatusPill tone="neutral"><Lock className="size-3" /> Kilitli</StatusPill>
        ),
    },
  ]

  const legColumns: Column<LegSummary>[] = [
    {
      key: 'partner',
      header: 'Bacak / Direkt Ortak',
      cell: (l) => (
        <div className="flex items-center gap-2.5">
          <PartnerAvatar name={l.partnerName} seed={l.partnerVeloxId} />
          <div>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              {l.partnerName}
              {l.isStrongLeg && (
                <span className="inline-flex items-center gap-0.5 rounded bg-cyan/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-light-cyan">
                  <Zap className="size-3" /> Güçlü
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">{l.partnerVeloxId}</div>
          </div>
        </div>
      ),
    },
    { key: 'members', header: 'Üye', align: 'right', cell: (l) => <span className="font-mono tabular-nums">{safeNumber(l.members)}</span> },
    { key: 'active', header: 'Aktif', align: 'right', cell: (l) => <span className="font-mono tabular-nums">{safeNumber(l.active)}</span> },
    { key: 'qualified', header: 'Nitelikli', align: 'right', cell: (l) => <span className="font-mono tabular-nums">{safeNumber(l.qualified)}</span> },
    { key: 'volume', header: 'Hacim', align: 'right', cell: (l) => <span className="font-mono tabular-nums text-foreground">{formatUSDT(l.volume, 0)}</span> },
    {
      key: 'pct',
      header: 'Takım %',
      align: 'right',
      cell: (l) => (
        <div className="flex items-center justify-end gap-2">
          <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-surface sm:block">
            <div className="velox-gradient h-full rounded-full" style={{ width: `${Math.max(3, l.percentOfTeam)}%` }} />
          </div>
          <span className="font-mono tabular-nums">{formatPercent(l.percentOfTeam, 0)}</span>
        </div>
      ),
    },
  ]

  const earningColumns: Column<CommissionRow>[] = [
    { key: 'date', header: 'Tarih', cell: (c) => formatDate(c.date) },
    {
      key: 'source',
      header: 'Kaynak Ortak',
      cell: (c) => (
        <div>
          <div className="font-medium text-foreground">{c.sourceName}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{c.sourceVeloxId}</div>
        </div>
      ),
    },
    { key: 'depth', header: 'Derinlik', align: 'center', cell: (c) => <span className="font-mono">L{c.depth}</span> },
    { key: 'sv', header: 'Kaynak Hacim', align: 'right', cell: (c) => <span className="font-mono tabular-nums">{formatUSDT(c.sourceVolume, 0)}</span> },
    { key: 'rate', header: 'Oran', align: 'right', cell: (c) => <span className="font-mono tabular-nums">{formatPercent(c.rate, 1)}</span> },
    { key: 'commission', header: 'Komisyon', align: 'right', cell: (c) => <span className="font-mono tabular-nums text-light-cyan">{formatUSDT(c.commission, 2)}</span> },
    { key: 'status', header: 'Durum', align: 'center', cell: (c) => <StatusPill tone={earningStatusMeta[c.status]}>{c.status}</StatusPill> },
  ]

  return (
    <div>
      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Toplam ağ" value={safeNumber(summary.totalNetwork)} hint="tüm seviyeler" />
        <StatTile label="Direkt ortak" value={safeNumber(summary.directPartners)} />
        <StatTile label="Aktif ortak" value={safeNumber(summary.activePartners)} />
        <StatTile label="Nitelikli ortak" value={safeNumber(summary.qualifiedPartners)} />
        <StatTile label="Kişisel hacim" value={formatUSDT(summary.personalVolume, 0)} />
        <StatTile label="Direkt hacim" value={formatUSDT(summary.directVolume, 0)} />
        <StatTile label="Takım hacmi" value={formatUSDT(summary.teamVolume, 0)} accent />
        <StatTile label="Güçlü bacak" value={formatUSDT(summary.strongLegVolume, 0)} />
        <StatTile label="Diğer bacaklar" value={formatUSDT(summary.otherLegVolume, 0)} />
        <StatTile label="Kariyer" value={summary.currentCareer} accent />
      </div>

      {/* Referral + career progress */}
      <div className="mb-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <ReferralCard referralCode={props.referralCode} />
        <Panel>
          <PanelHeader
            title="Kariyer ilerlemesi"
            right={<Eyebrow>{careerProgress.currentCareer.name}</Eyebrow>}
          />
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <Award className="size-4 text-electric" />
                {careerProgress.currentCareer.name}
              </span>
              {careerProgress.nextCareer && (
                <span className="text-muted-foreground">
                  → {careerProgress.nextCareer.name}
                </span>
              )}
            </div>
            <ProgressBar value={careerProgress.progress} />
            <div className="mt-1.5 text-right text-xs text-muted-foreground">
              %{Math.round(careerProgress.progress)} tamamlandı
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-border bg-elevated px-3 py-2">
                <span className="text-muted-foreground">Açılan derinlik</span>
                <div className="mt-0.5 font-mono text-sm text-foreground">{props.unlockedDepth} / 33</div>
              </div>
              <div className="rounded-md border border-border bg-elevated px-3 py-2">
                <span className="text-muted-foreground">Günlük çekim limiti</span>
                <div className="mt-0.5 font-mono text-sm text-foreground">
                  {formatUSDT(careerProgress.currentCareer.dailyWithdrawalLimit, 0)}
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Explorer tabs */}
      <Panel className="mb-4">
        <PanelHeader
          title="Sponsor ağ gezgini"
          right={
            <div className="flex flex-wrap items-center gap-2">
              {tab === 'list' && (
                <>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="İsim / VLX ID ara"
                      className="h-7 w-40 rounded-md border border-border bg-elevated pl-7 pr-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-electric"
                    />
                  </div>
                  <select
                    value={String(levelFilter)}
                    onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="h-7 rounded-md border border-border bg-elevated px-2 text-xs text-foreground outline-none focus:border-electric"
                  >
                    <option value="all">Tüm seviyeler</option>
                    {levels.map((l) => (
                      <option key={l} value={l}>Seviye {l}</option>
                    ))}
                  </select>
                </>
              )}
              <div className="inline-flex rounded-md border border-border bg-elevated p-0.5">
                {TABS.map((t) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors',
                        tab === t.key
                          ? 'velox-gradient text-primary-foreground'
                          : 'text-secondary-foreground hover:text-foreground',
                      )}
                    >
                      <Icon className="size-3.5" />
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>
          }
        />

        {tab === 'tree' && <SponsorTree root={props.tree} />}
        {tab === 'list' && (
          <DataTable
            columns={listColumns}
            rows={filtered}
            getRowKey={(p) => p.id}
            empty={{ title: 'Ortak bulunamadı', description: 'Arama veya seviye filtresini değiştirin.', icon: <Users className="size-4" /> }}
          />
        )}
        {tab === 'depth' && (
          <DataTable
            columns={depthColumns}
            rows={safeArray<DepthRow>(props.depthRows)}
            getRowKey={(d) => String(d.level)}
            empty={{ title: 'Derinlik verisi yok', icon: <Layers className="size-4" /> }}
          />
        )}
        {tab === 'legs' && (
          <DataTable
            columns={legColumns}
            rows={safeArray<LegSummary>(props.legs)}
            getRowKey={(l) => l.id}
            empty={{ title: 'Bacak bulunamadı', description: 'Henüz direkt ortağınız yok.', icon: <GitBranch className="size-4" /> }}
          />
        )}
      </Panel>

      {/* Network earnings */}
      <Panel>
        <PanelHeader
          title="Ağ kazançları"
          right={
            <span className="inline-flex items-center gap-1.5 text-sm">
              <TrendingUp className="size-4 text-light-cyan" />
              <span className="font-mono tabular-nums text-light-cyan">{formatUSDT(props.totalEarnings, 2)}</span>
            </span>
          }
        />
        <DataTable
          columns={earningColumns}
          rows={safeArray<CommissionRow>(props.earnings)}
          getRowKey={(c) => c.id}
          empty={{ title: 'Kazanç kaydı yok', description: 'Ağ hacmi oluştukça komisyonlar burada listelenir.', icon: <TrendingUp className="size-4" /> }}
        />
      </Panel>
    </div>
  )
}
