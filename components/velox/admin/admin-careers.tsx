'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Award, Check, Loader2 } from 'lucide-react'
import { Panel, PanelHeader, Eyebrow } from '@/components/velox/primitives'
import { applyOneTradeCareerPlan, updateCareer, updateCareerRequirement, updateCashbackTier } from '@/app/actions/admin'
import { formatUSDT } from '@/lib/format'
import { cn } from '@/lib/utils'

type Requirement = {
  id: number
  careerId: number
  requiredPersonalPartners: number
  requiredActivePartners: number
  requiredQualifiedPartners: number
  requiredPersonalInvestment: string
  requiredPersonalVolume: string
  requiredDirectVolume: string
  requiredTeamVolume: string
  requiredStrongLegVolume: string
  requiredOtherLegVolume: string
} | null

export type AdminCareer = {
  id: number
  code: string
  name: string
  displayOrder: number
  unlockedDepth: number
  dailyWithdrawalLimit: number
  careerReward: number
  enabled: boolean
  requirement: Requirement
}

export type AdminCashbackTier = {
  id: number
  code: string
  name: string
  displayOrder: number
  fromDepth: number
  toDepth: number
  requiredTeamVolume: string
  requiredDirectPartners: number
  cashbackAmount: string
  dailyWithdrawalLimit: string
  enabled: boolean
}

const REQ_FIELDS: { key: string; label: string }[] = [
  { key: 'requiredPersonalPartners', label: 'Kişisel Partner' },
  { key: 'requiredActivePartners', label: 'Aktif Partner' },
  { key: 'requiredQualifiedPartners', label: 'Nitelikli Partner' },
  { key: 'requiredPersonalInvestment', label: 'Kişisel Yatırım' },
  { key: 'requiredPersonalVolume', label: 'Kişisel Hacim' },
  { key: 'requiredDirectVolume', label: 'Direkt Hacim' },
  { key: 'requiredStrongLegVolume', label: 'Uzun Bacak' },
  { key: 'requiredOtherLegVolume', label: 'Kısa Bacaklar Toplamı' },
]

function CareerRow({ c }: { c: AdminCareer }) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [depth, setDepth] = useState(c.unlockedDepth)
  const [limit, setLimit] = useState(c.dailyWithdrawalLimit)
  const [reward, setReward] = useState(c.careerReward)
  const [enabled, setEnabled] = useState(c.enabled)
  const [reqs, setReqs] = useState<Record<string, number>>(() => {
    const r = c.requirement
    return {
      requiredPersonalPartners: r ? Number(r.requiredPersonalPartners) : 0,
      requiredActivePartners: r ? Number(r.requiredActivePartners) : 0,
      requiredQualifiedPartners: r ? Number(r.requiredQualifiedPartners) : 0,
      requiredPersonalInvestment: r ? Number(r.requiredPersonalInvestment) : 0,
      requiredPersonalVolume: r ? Number(r.requiredPersonalVolume) : 0,
      requiredDirectVolume: r ? Number(r.requiredDirectVolume) : 0,
      requiredTeamVolume: r ? Number(r.requiredTeamVolume) : 0,
      requiredStrongLegVolume: r ? Number(r.requiredStrongLegVolume) : 0,
      requiredOtherLegVolume: r ? Number(r.requiredOtherLegVolume) : 0,
    }
  })

  function save() {
    startTransition(async () => {
      await updateCareer({
        id: c.id,
        unlockedDepth: depth,
        dailyWithdrawalLimit: limit,
        careerReward: reward,
        enabled,
      })
      await updateCareerRequirement({ careerId: c.id, ...(reqs as Record<string, number>) } as never)
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-electric/15 text-electric">
            <Award className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-bright">{c.name}</p>
            <Eyebrow>Seviye {c.displayOrder}</Eyebrow>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-secondary-foreground">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="size-4 accent-[var(--electric)]"
          />
          Aktif
        </label>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Field label="Açılan derinlik (0-33)">
          <input
            type="number"
            min={0}
            max={33}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="velox-input"
          />
        </Field>
        <Field label="Günlük çekim limiti (USDT)">
          <input
            type="number"
            min={0}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="velox-input"
          />
        </Field>
        <Field label="Kariyer ödülü (USDT)">
          <input
            type="number"
            min={0}
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="velox-input"
          />
        </Field>
      </div>

      <Eyebrow>Yeterlilik gereksinimleri</Eyebrow>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {REQ_FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            <input
              type="number"
              min={0}
              value={reqs[f.key]}
              onChange={(e) => setReqs((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
              className="velox-input"
            />
          </Field>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <span className="text-xs text-muted-foreground">
          {formatUSDT(reward)} ödül · {depth}/33 derinlik
        </span>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className={cn(
            'inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60',
            saved ? 'bg-success' : 'velox-gradient',
          )}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="size-4" /> Kaydedildi
            </>
          ) : (
            'Kaydet'
          )}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function CashbackTierRow({ tier }: { tier: AdminCashbackTier }) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [teamVolume, setTeamVolume] = useState(Number(tier.requiredTeamVolume))
  const [directs, setDirects] = useState(tier.requiredDirectPartners)
  const [amount, setAmount] = useState(Number(tier.cashbackAmount))
  const [limit, setLimit] = useState(Number(tier.dailyWithdrawalLimit))
  const [enabled, setEnabled] = useState(tier.enabled)

  function save() {
    startTransition(async () => {
      await updateCashbackTier({ id: tier.id, requiredTeamVolume: teamVolume, requiredDirectPartners: directs, cashbackAmount: amount, dailyWithdrawalLimit: limit, enabled })
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    })
  }

  return <div className="rounded-lg border border-border bg-card p-4">
    <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-bright">{tier.name}</p><Eyebrow>Seviye {tier.fromDepth}–{tier.toDepth} · Bağımsız cashback</Eyebrow></div><label className="flex items-center gap-2 text-xs text-secondary-foreground"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="size-4 accent-[var(--electric)]" />Aktif</label></div>
    <div className="grid gap-3 sm:grid-cols-4">
      <Field label="Ağ hacmi (USDT)"><input type="number" min={0} value={teamVolume} onChange={(event) => setTeamVolume(Number(event.target.value))} className="velox-input" /></Field>
      <Field label="Aktif doğrudan ortak"><input type="number" min={0} value={directs} onChange={(event) => setDirects(Number(event.target.value))} className="velox-input" /></Field>
      <Field label="Cashback (USDT)"><input type="number" min={0} value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="velox-input" /></Field>
      <Field label="Günlük limit (USDT)"><input type="number" min={0} value={limit} onChange={(event) => setLimit(Number(event.target.value))} className="velox-input" /></Field>
    </div>
    <div className="mt-4 flex justify-end"><button type="button" onClick={save} disabled={pending} className={cn('inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60', saved ? 'bg-success' : 'velox-gradient')}>{pending ? <Loader2 className="size-4 animate-spin" /> : saved ? <><Check className="size-4" />Kaydedildi</> : 'Cashback kaydet'}</button></div>
  </div>
}

export function AdminCareers({ careers, cashbackTiers }: { careers: AdminCareer[]; cashbackTiers: AdminCashbackTier[] }) {
  const router = useRouter()
  const [applyingPlan, startPlanTransition] = useTransition()

  function applyPlan() {
    if (!window.confirm('OneTrade demo planı uygulanacak. Kariyer koşulları ile bağımsız cashback hacim/ödül kademeleri ayrı ayrı güncellenecek. Devam edilsin mi?')) return
    startPlanTransition(async () => {
      await applyOneTradeCareerPlan()
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Kariyer Yönetimi"
          right={
            <div className="flex items-center gap-3">
              <Eyebrow>{careers.length} kariyer</Eyebrow>
              <button
                type="button"
                onClick={applyPlan}
                disabled={applyingPlan}
                className="inline-flex h-8 items-center gap-2 rounded-md border border-cyan/50 bg-cyan/10 px-3 text-xs font-semibold text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-60"
              >
                {applyingPlan && <Loader2 className="size-3.5 animate-spin" />}
                Kariyer + cashback planını uygula
              </button>
            </div>
          }
        />
        <p className="border-b border-border px-4 py-3 text-xs leading-5 text-muted-foreground">
          Kariyer koşulları ve cashback koşulları birbirinden bağımsızdır. Kariyer; kişisel yatırım, aktif ortak, direkt hacim ve uzun/kısa bacak dengesine göre hesaplanır. Cashback yalnız ağ hacmi ve aktif doğrudan ortak şartına göre değerlendirilir.
        </p>
        <div className="space-y-4 p-4">
          {careers.map((c) => (
            <CareerRow key={c.id} c={c} />
          ))}
        </div>
      </Panel>
      <Panel>
        <PanelHeader title="Cashback Kademeleri" right={<Eyebrow>{cashbackTiers.length} bağımsız kademe</Eyebrow>} />
        <p className="border-b border-border px-4 py-3 text-xs leading-5 text-muted-foreground">Bu alan kariyer terfisini değiştirmez. Üye, kendi kariyerinden bağımsız olarak ağ hacmi ve aktif doğrudan ortak koşulunu tamamladığında demo cashback kademesine uygun görünür.</p>
        <div className="space-y-4 p-4">{cashbackTiers.length === 0 ? <p className="text-sm text-muted-foreground">Önce üstteki “Kariyer + cashback planını uygula” düğmesini kullan.</p> : cashbackTiers.map((tier) => <CashbackTierRow key={tier.id} tier={tier} />)}</div>
      </Panel>
    </div>
  )
}
