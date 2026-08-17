'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, CircleDot, FileText, TimerReset } from 'lucide-react'
import { Panel, PanelHeader, StatTile, StatusPill } from '@/components/velox/primitives'
import { formatUSDT } from '@/lib/format'

type ContractStatus = 'open' | 'completed'
type TimelineItem = { at: string; title: string; detail: string }
type ContractItem = { id: string; number: string; title: string; amount: number; status: ContractStatus; createdAt: string; completedAt?: string; events: TimelineItem[] }

// This portfolio is deliberately demo-only until the admin contract workflow
// is connected. Dates and amounts are visual sample records, not promises or
// payment records.
const demoContracts: ContractItem[] = [
  { id: 'gp-open', number: 'VLX-GP-DEMO-0817', title: 'General Partner Demo Özeti', amount: 3000, status: 'open', createdAt: '2026-08-17T16:10:00+03:00', events: [
    { at: '2026-08-17T16:10:00+03:00', title: 'Sözleşme kaydı oluşturuldu', detail: 'Demo sözleşme portföyüne eklendi.' },
    { at: '2026-08-17T16:14:00+03:00', title: 'Demo onay görünümü hazırlandı', detail: 'Kaşe ve elektronik demo onayı görüntülenebilir.' },
  ] },
  { id: 'arb-complete', number: 'VLX-ARB-DEMO-0807', title: 'Arbitraj Standart Demo Özeti', amount: 1200, status: 'completed', createdAt: '2026-08-07T11:05:00+03:00', completedAt: '2026-08-15T18:40:00+03:00', events: [
    { at: '2026-08-07T11:05:00+03:00', title: 'Sözleşme kaydı oluşturuldu', detail: 'Demo sözleşme takip süreci başlatıldı.' },
    { at: '2026-08-11T09:30:00+03:00', title: 'Taahhüt kontrolü güncellendi', detail: 'Demo süreç adımları gözden geçirildi.' },
    { at: '2026-08-15T18:40:00+03:00', title: 'Taahhüt tamamlandı', detail: 'Sözleşme demo olarak kapalı duruma alındı.' },
  ] },
]

const status = { open: { label: 'Açık', tone: 'active' as const }, completed: { label: 'Tamamlandı', tone: 'success' as const } }

function formatMoment(value: string) {
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(new Date(value))
}

export function ContractPortfolioView({ memberName, veloxId }: { memberName: string; veloxId: string }) {
  const [selectedId, setSelectedId] = useState(demoContracts[0].id)
  const selected = demoContracts.find((item) => item.id === selectedId) ?? demoContracts[0]
  const open = demoContracts.filter((item) => item.status === 'open')
  const completed = demoContracts.filter((item) => item.status === 'completed')
  const total = useMemo(() => demoContracts.reduce((sum, item) => sum + item.amount, 0), [])

  return <div>
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h1 className="flex items-center gap-2 text-xl font-semibold text-foreground"><FileText className="size-5 text-cyan" /> Sözleşmelerim</h1><p className="mt-1 text-sm text-muted-foreground">Açık ve tamamlanan demo sözleşmelerin gün, tarih ve saat bazlı takip ekranı.</p></div><StatusPill tone="warning">Demo kayıtlar · Bağlayıcı değildir</StatusPill></div>
    <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Bu sayfadaki sözleşme tutarları, taahhüt durumları ve zaman çizelgesi demo görünümüdür. Gerçek ödeme, yatırım veya hukukî taahhüt kaydı oluşturmaz.</div>
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><StatTile label="Toplam sözleşme hacmi" value={formatUSDT(total, 2)} hint="Demo portföy" accent /><StatTile label="Açık sözleşmeler" value={open.length} hint="Taahhüt süreci devam eden" /><StatTile label="Tamamlanan sözleşmeler" value={completed.length} hint="Kapalı demo kayıtlar" /></div>
    <div className="mb-5 rounded-lg border border-border bg-card px-4 py-3 text-sm text-secondary-foreground"><span className="font-semibold text-foreground">Hesap:</span> {memberName} <span className="ml-2 font-mono text-xs text-muted-foreground">{veloxId}</span></div>
    <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]"><div className="space-y-4"><ContractList title="Açık sözleşmeler" items={open} selectedId={selectedId} onSelect={setSelectedId} /><ContractList title="Tamamlanan sözleşmeler" items={completed} selectedId={selectedId} onSelect={setSelectedId} completed /></div><Timeline contract={selected} /></div>
  </div>
}

function ContractList({ title, items, selectedId, onSelect, completed }: { title: string; items: ContractItem[]; selectedId: string; onSelect: (id: string) => void; completed?: boolean }) {
  return <Panel><PanelHeader title={title} right={<span className="text-xs text-muted-foreground">{items.length} kayıt</span>} />{items.length === 0 ? <div className="px-5 py-10 text-center text-sm text-muted-foreground">Kayıt yok.</div> : <div className="divide-y divide-border">{items.map((item) => <button key={item.id} type="button" onClick={() => onSelect(item.id)} className={item.id === selectedId ? 'w-full bg-cyan/10 px-5 py-4 text-left' : 'w-full px-5 py-4 text-left hover:bg-elevated/60'}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><p className="font-mono text-sm font-semibold text-foreground">{item.number}</p><StatusPill tone={status[item.status].tone}>{status[item.status].label}</StatusPill></div><p className="mt-1 text-sm text-secondary-foreground">{item.title}</p><p className="mt-2 text-xs text-muted-foreground">Açılış: {formatMoment(item.createdAt)}{completed && item.completedAt ? ` · Kapanış: ${formatMoment(item.completedAt)}` : ''}</p></div><p className="font-mono text-sm font-semibold text-foreground">{formatUSDT(item.amount, 2)}</p></div></button>)}</div>}</Panel>
}

function Timeline({ contract }: { contract: ContractItem }) {
  return <Panel className="h-fit"><PanelHeader title="Sözleşme durumu ve geçmişi" right={<StatusPill tone={status[contract.status].tone}>{status[contract.status].label}</StatusPill>} /><div className="p-5"><p className="font-mono text-sm font-semibold text-cyan">{contract.number}</p><p className="mt-1 font-medium text-foreground">{contract.title}</p><div className="mt-4 grid grid-cols-2 gap-3"><Info label="Sözleşme hacmi" value={formatUSDT(contract.amount, 2)} /><Info label="Oluşturulma" value={formatMoment(contract.createdAt)} />{contract.completedAt && <Info label="Tamamlanma" value={formatMoment(contract.completedAt)} />}</div><div className="mt-6 space-y-0">{contract.events.map((event, index) => <div key={event.at} className="relative flex gap-3 pb-5 last:pb-0"><div className="flex flex-col items-center"><div className="flex size-7 items-center justify-center rounded-full border border-cyan/30 bg-cyan/10 text-cyan">{index === contract.events.length - 1 && contract.status === 'completed' ? <CheckCircle2 className="size-4" /> : <CircleDot className="size-4" />}</div>{index < contract.events.length - 1 && <div className="mt-1 h-full w-px bg-border" />}</div><div className="pb-1"><p className="text-sm font-semibold text-foreground">{event.title}</p><p className="mt-1 text-xs leading-5 text-secondary-foreground">{event.detail}</p><p className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="size-3" /> {formatMoment(event.at)}</p></div></div>)}</div><div className="mt-5 flex items-center gap-2 rounded-md border border-border bg-elevated px-3 py-2 text-xs text-muted-foreground"><TimerReset className="size-3.5 text-cyan" /> Gün, tarih ve saat bazlı sözleşme geçmişi.</div></div></Panel>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-border bg-elevated px-3 py-2"><p className="text-[10px] uppercase tracking-[.1em] text-muted-foreground">{label}</p><p className="mt-1 text-xs font-medium text-foreground">{value}</p></div> }
