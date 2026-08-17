'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Panel, PanelHeader, Eyebrow } from '@/components/velox/primitives'
import { updateCommissionLevel } from '@/app/actions/admin'
import { cn } from '@/lib/utils'

export type AdminCommission = {
  id: number
  level: number
  percentage: number
  requiredCareerCode: string
  enabled: boolean
}

function CommissionRow({ row, careerCodes }: { row: AdminCommission; careerCodes: string[] }) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [pct, setPct] = useState(row.percentage)
  const [careerCode, setCareerCode] = useState(row.requiredCareerCode)
  const [enabled, setEnabled] = useState(row.enabled)

  function save() {
    startTransition(async () => {
      await updateCommissionLevel({
        id: row.id,
        percentage: pct,
        requiredCareerCode: careerCode,
        enabled,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-elevated font-mono text-xs font-semibold text-bright">
        L{row.level}
      </span>

      <label className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground">Oran %</span>
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="velox-input h-8 w-20 px-2"
        />
      </label>

      <label className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground">Gereken kariyer</span>
        <select
          value={careerCode}
          onChange={(e) => setCareerCode(e.target.value)}
          className="velox-input h-8 w-40 px-2"
        >
          {careerCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-xs text-secondary-foreground">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="size-4 accent-[var(--electric)]"
        />
        Aktif
      </label>

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className={cn(
          'ml-auto inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold text-primary-foreground transition-opacity disabled:opacity-60',
          saved ? 'bg-success' : 'velox-gradient',
        )}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : saved ? (
          <>
            <Check className="size-3.5" /> Kaydedildi
          </>
        ) : (
          'Kaydet'
        )}
      </button>
    </div>
  )
}

export function AdminCommissions({
  levels,
  careerCodes,
}: {
  levels: AdminCommission[]
  careerCodes: string[]
}) {
  return (
    <Panel>
      <PanelHeader
        title="Komisyon Seviyeleri"
        right={<Eyebrow>{levels.length} seviye (1-33)</Eyebrow>}
      />
      <div className="divide-y divide-border">
        {levels.map((row) => (
          <CommissionRow key={row.id} row={row} careerCodes={careerCodes} />
        ))}
      </div>
    </Panel>
  )
}
