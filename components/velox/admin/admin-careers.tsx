'use client'

import { useState, useTransition } from 'react'
import { Award, Check, Loader2 } from 'lucide-react'
import { Panel, PanelHeader, Eyebrow } from '@/components/velox/primitives'
import { updateCareer, updateCareerRequirement } from '@/app/actions/admin'
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

const REQ_FIELDS: { key: string; label: string }[] = [
  { key: 'requiredPersonalPartners', label: 'Kişisel Partner' },
  { key: 'requiredActivePartners', label: 'Aktif Partner' },
  { key: 'requiredQualifiedPartners', label: 'Nitelikli Partner' },
  { key: 'requiredPersonalInvestment', label: 'Kişisel Yatırım' },
  { key: 'requiredPersonalVolume', label: 'Kişisel Hacim' },
  { key: 'requiredDirectVolume', label: 'Direkt Hacim' },
  { key: 'requiredTeamVolume', label: 'Takım Hacmi' },
  { key: 'requiredStrongLegVolume', label: 'Güçlü Bacak' },
  { key: 'requiredOtherLegVolume', label: 'Diğer Bacaklar' },
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

export function AdminCareers({ careers }: { careers: AdminCareer[] }) {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Kariyer Yönetimi"
          right={<Eyebrow>{careers.length} kariyer</Eyebrow>}
        />
        <div className="space-y-4 p-4">
          {careers.map((c) => (
            <CareerRow key={c.id} c={c} />
          ))}
        </div>
      </Panel>
    </div>
  )
}
