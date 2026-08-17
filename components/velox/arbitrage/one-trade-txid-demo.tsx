'use client'

import { useState } from 'react'
import { ArrowRight, ExternalLink, FileSearch, Plus, ShieldCheck } from 'lucide-react'
import { TetherIcon } from '@/components/velox/tether-icon'
import { formatDateTime, formatNumber } from '@/lib/format'

type TxRecord = { id: string; pool: string; createdAt: string; from: string; to: string; amount: number; spread: number }

const exchanges = [
  { name: 'Sakura Moon Capital LTD', code: 'SAKURA' },
  { name: 'Nexora Fintech LTD', code: 'NEXORA' },
  { name: 'Simha Fintech LTD', code: 'SIMHA' },
  { name: 'Next Trade X', code: 'CXI' },
]

const initialRecords: TxRecord[] = [
  { id: 'onet-demo-001', pool: 'Havuz #6', createdAt: new Date(Date.now() - 11 * 60_000).toISOString(), from: 'BITCIRAZ', to: 'CXI', amount: 1280.5, spread: 4.28 },
  { id: 'onet-demo-002', pool: 'Havuz #6', createdAt: new Date(Date.now() - 34 * 60_000).toISOString(), from: 'NEXORA', to: 'SAKURA', amount: 880, spread: 2.77 },
  { id: 'onet-demo-003', pool: 'Havuz #7', createdAt: new Date(Date.now() - 56 * 60_000).toISOString(), from: 'SAKURA', to: 'BITCIRAZ', amount: 1540.6, spread: 4.88 },
]

function openDetail(record: TxRecord) {
  const params = new URLSearchParams({ id: record.id, createdAt: record.createdAt, buyExchange: record.from, sellExchange: record.to, buyPrice: '2418.62', sellPrice: '2421.94', volume: String(record.amount / 2418.62), spread: String(record.spread) })
  window.open(`/trade-demo?${params.toString()}`, '_blank', 'noopener,noreferrer')
}

export function OneTradeTxidDemo() {
  const [records, setRecords] = useState(initialRecords)
  const addDemoRecord = () => {
    const index = records.length % exchanges.length
    setRecords((current) => [{ id: `onet-demo-${Date.now()}`, pool: `Havuz #${6 + (current.length % 4)}`, createdAt: new Date().toISOString(), from: exchanges[index].code, to: exchanges[(index + 1) % exchanges.length].code, amount: 500 + Math.random() * 2500, spread: 0.8 + Math.random() * 5 }, ...current])
  }
  return <div className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-bold text-foreground">Txid OneTrade</h1><p className="mt-1 text-sm text-muted-foreground">Havuz demo hareketleri ve işlem ayrıntıları.</p></div><span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold text-amber-300"><ShieldCheck className="size-3.5" /> Demo kayıtları</span></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
      <section className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold text-foreground">OneTrade hareketi</h2><p className="mt-1 text-xs text-muted-foreground">Satıra tıklayınca ayrıntı ve simülasyon TXID yeni sekmede açılır.</p></div><button onClick={addDemoRecord} className="inline-flex items-center gap-1.5 rounded-md velox-gradient px-3 py-2 text-xs font-semibold text-primary-foreground"><Plus className="size-3.5" /> Demo kayıt</button></div><div className="mt-4 space-y-2">{records.map((record) => <button key={record.id} onClick={() => openDetail(record)} className="w-full rounded-lg border border-border bg-elevated/30 p-3 text-left transition-colors hover:border-cyan/50 hover:bg-elevated/70"><div className="flex justify-between gap-3 text-xs text-muted-foreground"><span>{record.pool}</span><span>{formatDateTime(record.createdAt)}</span></div><div className="mt-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-semibold text-cyan"><span>{record.from}</span><ArrowRight className="size-4" /><span>{record.to}</span></div><span className="inline-flex items-center gap-1 font-mono text-sm font-bold text-foreground"><TetherIcon className="size-4" />{formatNumber(record.amount, 2)}</span></div><div className="mt-3 flex justify-between border-t border-border pt-2 text-xs"><span className="font-mono text-muted-foreground">{record.id}</span><span className="text-cyan">Demo TXID ayrıntısı ↗</span></div></button>)}</div></section>
      <aside className="space-y-4"><section className="rounded-xl border border-border bg-card p-4"><h2 className="text-base font-semibold text-foreground">Aktif borsa demoları</h2><div className="mt-3 divide-y divide-border">{exchanges.map((exchange) => <button key={exchange.code} onClick={() => window.open(`/market-demo?exchange=${exchange.code}&side=buy&price=2418.62`, '_blank', 'noopener,noreferrer')} className="flex w-full items-center justify-between py-3 text-left hover:text-cyan"><div><p className="text-sm font-semibold text-foreground">{exchange.name}</p><p className="mt-1 text-xs text-muted-foreground">{exchange.code} · Piyasa demosu</p></div><span className="inline-flex items-center gap-1 text-xs font-semibold">Git <ExternalLink className="size-3.5" /></span></button>)}</div></section><section className="rounded-xl border border-cyan/20 bg-cyan/5 p-4"><div className="flex items-center gap-2 text-cyan"><FileSearch className="size-5" /><h2 className="font-semibold">Bilgi</h2></div><p className="mt-3 text-sm leading-6 text-secondary-foreground">Bu alan, havuz ve Pro demo akışından oluşan kayıtları tek yerde görüntülemek içindir. Her kayıt tıklanınca benzersiz bir <strong>Simülasyon TXID</strong> ayrıntısı açılır.</p><p className="mt-3 text-xs leading-5 text-muted-foreground">Gerçek zincir/borsa hash’i yalnızca gerçek işlem sonrasında doğrulanmış sağlayıcı kaynağından alınabilir.</p></section></aside>
    </div>
  </div>
}
