'use client'

import { useMemo, useState } from 'react'
import { Award, GitBranch, Layers3, Network, UsersRound } from 'lucide-react'
import { Panel, PanelHeader, ProgressBar, StatTile, StatusPill } from '@/components/velox/primitives'
import { PartnerAvatar } from '@/components/velox/network/partner-avatar'
import { ReferralCard } from '@/components/velox/network/referral-card'
import { SponsorTree } from '@/components/velox/network/sponsor-tree'
import { formatUSDT, safeArray, safeNumber } from '@/lib/format'
import type { NetworkListRow } from '@/lib/services/network.service'
import type { CareerProgress, CommissionRow, DepthRow, LegSummary, NetworkSummary, SponsorTreeNode } from '@/lib/network/types'

type Tab = 'overview' | 'tree' | 'depths' | 'career'

export function MatrixNetworkDashboard(props: {
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
}) {
  const [tab, setTab] = useState<Tab>('overview')
  const [level, setLevel] = useState<number>(1)
  const levelMembers = useMemo(() => safeArray(props.memberList).filter((item) => item.level === level), [level, props.memberList])
  const summary = props.summary

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground"><Network className="size-5 text-cyan" /> Ağ Programı</h1><p className="mt-1 text-sm text-muted-foreground">Sponsor ağınız, seviye derinlikleri, kariyer gelişimi ve yalnızca demo ağ geliri görünümü.</p></div>
        <StatusPill tone="warning">Demo ağ görünümü · Gerçek ödeme yok</StatusPill>
      </div>

      <div className="mb-5 grid grid-cols-2 rounded-lg border border-border bg-card p-1 md:grid-cols-4">
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} label="Ağ özeti" />
        <TabButton active={tab === 'tree'} onClick={() => setTab('tree')} label="Matris ağacı" />
        <TabButton active={tab === 'depths'} onClick={() => setTab('depths')} label="Derinlikler" />
        <TabButton active={tab === 'career'} onClick={() => setTab('career')} label="Kariyer" />
      </div>

      <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Bu ekran yalnızca kayıtlı sponsor ilişkilerini görselleştirir. Ağ geliri, komisyon ve çekim bilgileri demo amaçlıdır; bakiye veya ödeme hareketi oluşturmaz.</div>

      {tab === 'overview' && <Overview {...props} />}
      {tab === 'tree' && <Panel><PanelHeader title="Matris ağacı" right={<span className="text-xs text-muted-foreground">Kayıtlı sponsor bağlantıları</span>} /><SponsorTree root={props.tree} /></Panel>}
      {tab === 'depths' && <Depths level={level} onLevelChange={setLevel} members={levelMembers} depthRows={props.depthRows} unlockedDepth={props.unlockedDepth} />}
      {tab === 'career' && <Career progress={props.careerProgress} summary={summary} />}
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} className={active ? 'rounded-md velox-gradient px-3 py-2.5 text-sm font-semibold text-primary-foreground' : 'rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-elevated hover:text-foreground'}>{label}</button>
}

function Overview({ summary, referralCode, legs, depthRows }: Pick<Parameters<typeof MatrixNetworkDashboard>[0], 'summary' | 'referralCode' | 'legs' | 'depthRows'>) {
  const openLevels = safeArray(depthRows).filter((item) => item.unlocked).length
  const networkIncomePreview = safeArray(depthRows)
    .filter((item) => item.unlocked)
    .reduce((total, item) => total + (safeNumber(item.volume) * safeNumber(item.commissionRate)) / 100, 0)
  return <>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatTile label="Toplam ağ" value={safeNumber(summary.totalNetwork)} hint="Tüm kayıtlı seviyeler" accent /><StatTile label="Doğrudan bağlı" value={safeNumber(summary.directPartners)} hint="1. seviye" /><StatTile label="Ağ cirosu" value={formatUSDT(summary.teamVolume, 2)} hint="Kayıtlı ekip cirosu" /><StatTile label="Açık derinlik" value={`${openLevels} / 33`} hint={`Kariyer: ${summary.currentCareer}`} /></div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2"><Panel><PanelHeader title="Tüm takım cirosu" right={<GitBranch className="size-4 text-cyan" />} /><div className="p-5"><p className="font-mono text-3xl font-semibold tabular-nums text-foreground">{formatUSDT(summary.teamVolume, 2)}</p><p className="mt-1 text-sm text-muted-foreground">Tüm seviyelerdeki kayıtlı ekip cirosu</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Metric label="Direkt ciro" value={formatUSDT(summary.directVolume, 2)} /><Metric label="Güçlü bacak" value={formatUSDT(summary.strongLegVolume, 2)} /><Metric label="Diğer bacaklar" value={formatUSDT(summary.otherLegVolume, 2)} /><Metric label="Aktif ortak" value={summary.activePartners} /></div></div></Panel><Panel><PanelHeader title="Network geliri" right={<StatusPill tone="warning">Demo tahakkuk</StatusPill>} /><div className="p-5"><p className="font-mono text-3xl font-semibold tabular-nums text-light-cyan">{formatUSDT(networkIncomePreview, 2)}</p><p className="mt-1 text-sm text-muted-foreground">Açık derinliklerdeki ciro ve tanımlı oranlardan hesaplanan demo tutar</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Metric label="Hesaplanan seviye" value={`${openLevels} / 33`} /><Metric label="Mevcut kariyer" value={summary.currentCareer} /></div><p className="mt-4 text-xs leading-5 text-amber-200">Bu tutar ödeme, bakiye veya çekim hakkı değildir; yalnızca ağ geliri görünümünün demo hesaplamasıdır.</p></div></Panel></div>
    <div className="mt-4"><ReferralCard referralCode={referralCode} /></div>
    <Panel className="mt-4"><PanelHeader title="Doğrudan bacaklar" right={<span className="text-xs text-muted-foreground">Ağ ağacındaki ilk seviye</span>} />{legs.length === 0 ? <Empty text="Henüz doğrudan bacak oluşmadı." /> : <div className="divide-y divide-border">{legs.map((leg) => <div key={leg.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold text-foreground">{leg.partnerName} <span className="font-mono text-xs text-muted-foreground">{leg.partnerVeloxId}</span></p><p className="mt-1 text-xs text-muted-foreground">{leg.members} kişi · {leg.active} aktif · {leg.qualified} nitelikli</p></div><div className="text-right"><p className="font-mono text-sm font-semibold text-foreground">{formatUSDT(leg.volume, 2)}</p><p className="mt-1 text-xs text-muted-foreground">ekip cirosu · %{Math.round(leg.percentOfTeam)}</p></div></div>)}</div>}</Panel>
  </>
}

function Depths({ level, onLevelChange, members, depthRows, unlockedDepth }: { level: number; onLevelChange: (value: number) => void; members: NetworkListRow[]; depthRows: DepthRow[]; unlockedDepth: number }) {
  const row = safeArray(depthRows).find((item) => item.level === level)
  return <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]"><Panel><PanelHeader title="Seviye derinlikleri" right={<Layers3 className="size-4 text-cyan" />} /><div className="max-h-[640px] divide-y divide-border overflow-y-auto">{safeArray(depthRows).map((item) => <button key={item.level} type="button" onClick={() => onLevelChange(item.level)} className={item.level === level ? 'flex w-full items-center justify-between bg-cyan/10 px-5 py-3 text-left' : 'flex w-full items-center justify-between px-5 py-3 text-left hover:bg-elevated/60'}><span><span className="font-mono font-semibold text-foreground">Seviye {item.level}</span><span className="ml-2 text-xs text-muted-foreground">{item.members} kişi · {formatUSDT(item.volume, 0)}</span></span><StatusPill tone={item.unlocked ? 'success' : 'neutral'}>{item.unlocked ? 'Açık' : 'Kilitli'}</StatusPill></button>)}</div></Panel><Panel><PanelHeader title={`Seviye ${level} üyeleri`} right={<span className="text-xs text-muted-foreground">Açık derinlik: {unlockedDepth}/33</span>} />{row && !row.unlocked ? <Empty text="Bu seviye mevcut kariyerinizde kilitli." /> : members.length === 0 ? <Empty text="Bu seviyede kayıtlı üye yok." /> : <div className="divide-y divide-border">{members.map((member) => <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="flex items-center gap-3"><PartnerAvatar name={member.name} seed={member.veloxId} /><div><p className="font-semibold text-foreground">{member.name}</p><p className="font-mono text-xs text-muted-foreground">{member.veloxId} · {member.career}</p></div></div><div className="text-right"><p className="font-mono text-sm font-semibold text-foreground">{formatUSDT(member.teamVolume, 2)}</p><p className="text-xs text-muted-foreground">ekip cirosu</p></div></div>)}</div>}</Panel></div>
}

function Career({ progress, summary }: { progress: CareerProgress; summary: NetworkSummary }) {
  const next = progress.nextCareer
  return <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]"><Panel><PanelHeader title="Kariyer ilerlemesi" right={<Award className="size-4 text-cyan" />} /><div className="p-5"><div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[.12em] text-muted-foreground">Mevcut kariyer</p><p className="mt-1 text-2xl font-semibold text-foreground">{progress.currentCareer.name}</p></div>{next && <div className="text-right"><p className="text-xs text-muted-foreground">Sonraki hedef</p><p className="mt-1 font-semibold text-cyan">{next.name}</p></div>}</div><div className="mt-5"><ProgressBar value={progress.progress} /><p className="mt-2 text-right text-xs text-muted-foreground">%{Math.round(progress.progress)} tamamlandı</p></div><div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Toplam ağ" value={summary.totalNetwork} /><Metric label="Takım cirosu" value={formatUSDT(summary.teamVolume, 2)} /></div></div></Panel><Panel><PanelHeader title="Yeterlilik koşulları" right={<StatusPill tone={progress.progress >= 100 ? 'success' : 'active'}>{progress.progress >= 100 ? 'Yeterli' : 'Gelişimde'}</StatusPill>} /><div className="divide-y divide-border">{progress.requirements.length === 0 ? <Empty text="Bir sonraki kariyer hedefi bulunmuyor." /> : progress.requirements.map((item) => <div key={item.key} className="px-5 py-3"><div className="flex justify-between gap-3 text-sm"><span className="text-secondary-foreground">{item.label}</span><span className="font-mono text-foreground">{item.format === 'usdt' ? formatUSDT(item.current, 0) : item.current} / {item.format === 'usdt' ? formatUSDT(item.required, 0) : item.required}</span></div><ProgressBar value={item.progress} className="mt-2 h-1.5" /></div>)}</div></Panel></div>
}

function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-md border border-border bg-elevated px-3 py-2.5"><p className="text-[11px] uppercase tracking-[.1em] text-muted-foreground">{label}</p><p className="mt-1 font-mono text-sm font-semibold text-foreground">{value}</p></div> }
function Empty({ text }: { text: string }) { return <div className="px-5 py-12 text-center text-sm text-muted-foreground"><UsersRound className="mx-auto mb-2 size-6" />{text}</div> }
