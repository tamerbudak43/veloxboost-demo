'use client'

import { useMemo, useState } from 'react'
import { Check, X, Copy, ArrowDownToLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Panel, StatTile, StatusPill } from '@/components/velox/primitives'
import { demoWithdrawalQueue } from '@/lib/demo-data'
import { formatUSDT, formatDateTime, formatNumber, safeArray } from '@/lib/format'
import type { WithdrawalRequest } from '@/lib/types'

type Status = WithdrawalRequest['status']

function shortAddr(addr: string) {
  if (!addr || addr.length < 12) return addr
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`
}

export function AdminWithdrawals() {
  const initial = safeArray<WithdrawalRequest>(demoWithdrawalQueue)
  const [rows, setRows] = useState<WithdrawalRequest[]>(initial)

  function setStatus(id: string, status: Status) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const pending = useMemo(() => rows.filter((r) => r.status === 'pending'), [rows])
  const pendingTotal = pending.reduce((s, r) => s + (Number(r?.amount) || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Çekim Onayları</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Bekleyen çekim taleplerini inceleyin, onaylayın veya reddedin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Bekleyen talep" value={formatNumber(pending.length, 0)} />
        <StatTile label="Bekleyen tutar" value={formatUSDT(pendingTotal, 0)} accent />
        <StatTile label="Toplam talep" value={formatNumber(rows.length, 0)} />
      </div>

      <div className="space-y-3">
        {rows.map((r) => {
          const isPending = r.status === 'pending'
          return (
            <Panel key={r.id} className="p-0">
              <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-surface text-primary">
                    <ArrowDownToLine className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.userName}</span>
                      <span className="font-mono text-xs text-muted-foreground">{r.veloxId}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-mono">
                        {shortAddr(r.address)}
                        <Copy className="size-3" />
                      </span>
                      <span className="rounded bg-surface px-1.5 py-0.5">{r.network}</span>
                      <span>{formatDateTime(r.requestedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Net / Tutar
                    </div>
                    <div className="font-mono text-sm font-semibold tabular-nums">
                      {formatUSDT(r.net, 2)}{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        / {formatUSDT(r.amount, 2)}
                      </span>
                    </div>
                  </div>

                  {isPending ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus(r.id, 'rejected')}
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        <X />
                        Reddet
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setStatus(r.id, 'approved')}
                        className="velox-gradient text-primary-foreground"
                      >
                        <Check />
                        Onayla
                      </Button>
                    </div>
                  ) : (
                    <div className="w-28 text-right">
                      {r.status === 'approved' ? (
                        <StatusPill tone="success">Onaylandı</StatusPill>
                      ) : (
                        <StatusPill tone="danger">Reddedildi</StatusPill>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
