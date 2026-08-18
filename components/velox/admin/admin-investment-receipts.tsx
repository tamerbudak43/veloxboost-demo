'use client'

import { useState } from 'react'
import { Check, FileText } from 'lucide-react'
import { confirmInvestmentReceipt, type AdminInvestmentReceipt } from '@/app/actions/investment-receipt'
import { Button } from '@/components/ui/button'
import { Panel, StatTile } from '@/components/velox/primitives'
import { formatDateTime, formatUSDT } from '@/lib/format'

export function AdminInvestmentReceipts({ initialReceipts }: { initialReceipts: AdminInvestmentReceipt[] }) {
  const [receipts, setReceipts] = useState(initialReceipts)
  const [hashes, setHashes] = useState<Record<number, string>>({})
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function confirm(receipt: AdminInvestmentReceipt) {
    setError(null)
    setBusyId(receipt.id)
    try {
      const result = await confirmInvestmentReceipt(receipt.id, hashes[receipt.id] ?? '')
      if (!result.ok) {
        setError(result.error)
        return
      }
      setReceipts((current) => current.filter((item) => item.id !== receipt.id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Yatırım doğrulanamadı.')
    } finally {
      setBusyId(null)
    }
  }

  const total = receipts.reduce((sum, receipt) => sum + Number(receipt.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Yatırım Belgesi Onayları</h1>
        <p className="mt-1 text-sm text-muted-foreground">Blockchain hash değeri doğrulandıktan sonra kullanıcı PDF belgesini indirebilir.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Bekleyen yatırım" value={String(receipts.length)} />
        <StatTile label="Bekleyen toplam" value={formatUSDT(total, 2)} accent />
      </div>

      {error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      {receipts.length === 0 ? (
        <Panel className="p-8 text-center text-sm text-muted-foreground">Bekleyen yatırım talimatı yok.</Panel>
      ) : (
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <Panel key={receipt.id} className="p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-electric/10 text-bright"><FileText className="size-5" /></div>
                  <div>
                    <div className="font-medium text-foreground">{receipt.memberName} <span className="ml-2 font-mono text-xs text-muted-foreground">{receipt.receiptNumber}</span></div>
                    <p className="mt-1 text-xs text-muted-foreground">{receipt.memberEmail} • {formatUSDT(receipt.amount)} • {receipt.network} • {formatDateTime(receipt.issuedAt)}</p>
                    <p className="mt-1 max-w-xl break-all font-mono text-[11px] text-muted-foreground">Alıcı adresi: {receipt.receivingAddress}</p>
                    {receipt.depositMemo ? <p className="mt-1 max-w-xl break-all font-mono text-[11px] text-amber-200">Memo / Etiket: {receipt.depositMemo}</p> : null}
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 xl:w-[440px] xl:flex-row">
                  <input
                    value={hashes[receipt.id] ?? ''}
                    onChange={(event) => setHashes((current) => ({ ...current, [receipt.id]: event.target.value }))}
                    placeholder="Seçilen ağa ait işlem hash"
                    className="min-w-0 flex-1 rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-electric"
                  />
                  <Button onClick={() => confirm(receipt)} disabled={busyId === receipt.id} className="velox-gradient text-primary-foreground">
                    <Check />{busyId === receipt.id ? 'Doğrulanıyor…' : 'Doğrula'}
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}
