'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { DatabaseZap, Play, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react'
import { resetPhaseOneDemoBaseline, seedPhaseOneDemoSimulation } from '@/app/actions/admin'
import { Panel, PanelHeader, StatTile, StatusPill } from '@/components/velox/primitives'
import { formatDateTime, formatNumber, formatUSDT, safeArray, safeNumber } from '@/lib/format'

type DemoMember = { userId: string; name: string; veloxId: string; career: string; sponsorId: string | null; personalInvestment: number; createdAt: string | Date }
type Ledger = { id: number; userId: string; userName: string; veloxId: string; entryType: string; amount: number; status: string; reference: string; occurredAt: string }

const ENTRY_LABEL: Record<string, string> = {
  demo_investment: 'Demo yatırım',
  demo_accrual: 'Demo tahakkuk',
  demo_auto_withdrawal: 'Demo otomatik çekim',
}

export function AdminDemoSimulation({ members, ledger }: { members: DemoMember[]; ledger: Ledger[] }) {
  const [busy, startTransition] = useTransition()
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState('')
  const rows = safeArray<DemoMember>(members)
  const entries = safeArray<Ledger>(ledger)
  const investments = entries.filter((item) => item.entryType === 'demo_investment').reduce((sum, item) => sum + safeNumber(item.amount), 0)
  const accruals = entries.filter((item) => item.entryType === 'demo_accrual').reduce((sum, item) => sum + safeNumber(item.amount), 0)
  const withdrawals = entries.filter((item) => item.entryType === 'demo_auto_withdrawal').reduce((sum, item) => sum + Math.abs(safeNumber(item.amount)), 0)

  function seed() {
    startTransition(async () => {
      try {
        const result = await seedPhaseOneDemoSimulation()
        setNotice(`${result.created} demo üye, gün ${result.day} için yeniden oluşturuldu. Sayfayı yenileyin.`)
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Demo veri oluşturulamadı.')
      }
    })
  }

  function reset() {
    startTransition(async () => {
      try {
        const result = await resetPhaseOneDemoBaseline(confirmation)
        setNotice(`${result.retainedAdmin} admin hesabı korundu; tüm diğer test ve operasyon kayıtları sıfırlandı. Sayfayı yenileyin.`)
        setConfirmation('')
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Sıfırlama yapılamadı.')
      }
    })
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><DatabaseZap className="size-6 text-electric" /> Faz 1 Demo Simülasyonu</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Bu alan sentetik üyeleri ve işlem defterini kalıcı olarak test eder. Hiçbir satır kullanıcı hesabı, cüzdan, zincir işlemi veya ödeme talimatı değildir.</p></div><div className="flex flex-wrap gap-2"><Link href="/partners" className="inline-flex h-10 items-center rounded-md border border-cyan/45 px-4 text-sm font-semibold text-cyan hover:bg-cyan/10">Ana panel / ağ önizlemesi</Link><button type="button" onClick={seed} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-md velox-gradient px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? <RefreshCw className="size-4 animate-spin" /> : <Play className="size-4" />}{rows.length ? 'Test verisini yeniden kur' : '7 günlük test verisini kur'}</button></div></div>
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"><ShieldAlert className="mr-2 inline size-4" />Tüm kayıtlar `DEMO-` / `SIM` tanımlayıcılarıyla ayrılır. Otomatik çekim satırı yalnızca test durumudur; blockchain, ödeme veya cüzdan aktarımı yapılmaz.</div>
    {notice && <div className="rounded-md border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan">{notice}</div>}
    <Panel className="border-destructive/35 bg-destructive/5"><PanelHeader title="Faz 1 başlangıç sıfırlaması" right={<StatusPill tone="danger">Geri alınamaz</StatusPill>} /><div className="flex flex-wrap items-end gap-3 p-4"><label className="min-w-56 flex-1 text-xs text-muted-foreground">Onay için <span className="font-mono text-foreground">SIFIRLA</span> yaz<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="SIFIRLA" className="velox-input mt-1.5 h-10" /></label><button type="button" onClick={reset} disabled={busy || confirmation.trim().toUpperCase() !== 'SIFIRLA'} className="inline-flex h-10 items-center gap-2 rounded-md border border-destructive/50 px-4 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"><Trash2 className="size-4" />Sadece admin kalsın</button></div><p className="px-4 pb-4 text-xs text-muted-foreground">Açık oturumdaki admin hesabı korunur. Diğer üyeler, giriş hesapları, ağ kayıtları, makbuzlar, tahakkuklar ve çekimler silinir; admin değerleri sıfıra döner.</p></Panel>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatTile label="Demo üye" value={formatNumber(rows.length, 0)} /><StatTile label="Demo yatırım" value={formatUSDT(investments, 2)} accent /><StatTile label="Demo tahakkuk" value={formatUSDT(accruals, 2)} /><StatTile label="Demo otomatik çekim" value={formatUSDT(withdrawals, 2)} /></div>
    <Panel className="p-0"><PanelHeader title="Demo üye hesapları" right={<StatusPill tone="warning">Sentetik kayıt</StatusPill>} />{rows.length === 0 ? <div className="px-5 py-10 text-center text-sm text-muted-foreground">Henüz demo verisi kurulmadı.</div> : <div className="max-h-[420px] divide-y divide-border overflow-y-auto">{rows.map((item) => <div key={item.userId} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"><div><p className="font-semibold text-foreground">{item.name} <span className="font-mono text-xs text-muted-foreground">{item.veloxId}</span></p><p className="mt-1 text-xs text-muted-foreground">{item.career} · Sponsor: {item.sponsorId?.startsWith('demo-sim-') ? 'DEMO ağ üyesi' : 'Ana demo hesap'} · {formatDateTime(item.createdAt)}</p></div><p className="font-mono text-sm font-semibold text-foreground">{formatUSDT(item.personalInvestment, 2)}</p></div>)}</div>}</Panel>
    <Panel className="p-0"><PanelHeader title="Demo işlem defteri" right={<span className="text-xs text-muted-foreground">Son {entries.length} kayıt</span>} />{entries.length === 0 ? <div className="px-5 py-10 text-center text-sm text-muted-foreground">Demo işlem kaydı yok.</div> : <div className="max-h-[520px] divide-y divide-border overflow-y-auto">{entries.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"><div><p className="font-medium text-foreground">{ENTRY_LABEL[item.entryType] ?? item.entryType} <span className="ml-2 font-mono text-xs text-muted-foreground">{item.reference}</span></p><p className="mt-1 text-xs text-muted-foreground">{item.userName} · {item.veloxId} · {formatDateTime(item.occurredAt)}</p></div><div className="text-right"><p className={item.amount < 0 ? 'font-mono text-sm font-semibold text-rose-300' : 'font-mono text-sm font-semibold text-emerald-300'}>{item.amount < 0 ? '−' : '+'}{formatUSDT(Math.abs(item.amount), 2)}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.status}</p></div></div>)}</div>}</Panel>
  </div>
}
