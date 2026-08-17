'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Activity, FileText, Info, Pause, Play, ShieldCheck } from 'lucide-react'
import { TetherIcon } from '@/components/velox/tether-icon'
import { formatDateTime, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

type ProTrade = {
  id: string
  createdAt: string
  buyExchange: string
  sellExchange: string
  buyPrice: number
  sellPrice: number
  ethVolume: number
  netSpread: number
}

type Tab = 'trades' | 'accruals' | 'operations'

const pairs: Array<[string, string]> = [
  ['BITCIRAZ', 'CXI'],
  ['NEXORA', 'SAKURA'],
  ['SAKURA', 'BITCIRAZ'],
  ['CXI', 'NEXORA'],
]

function createDemoTrade(index: number): ProTrade {
  const [buyExchange, sellExchange] = pairs[index % pairs.length]
  const buyPrice = 2408 + Math.random() * 24
  const spread = 1.2 + Math.random() * 4.6
  const ethVolume = 0.35 + Math.random() * 2.2
  return {
    id: `pro-demo-${Date.now()}-${index}`,
    createdAt: new Date().toISOString(),
    buyExchange,
    sellExchange,
    buyPrice,
    sellPrice: buyPrice + spread,
    ethVolume,
    netSpread: Math.max(0.01, spread * ethVolume * 0.82),
  }
}

function openTradeDetail(trade: ProTrade) {
  const params = new URLSearchParams({
    id: trade.id,
    createdAt: trade.createdAt,
    buyExchange: trade.buyExchange,
    sellExchange: trade.sellExchange,
    buyPrice: String(trade.buyPrice),
    sellPrice: String(trade.sellPrice),
    volume: String(trade.ethVolume),
    spread: String(trade.netSpread),
  })
  window.open(`/trade-demo?${params.toString()}`, '_blank', 'noopener,noreferrer')
}

export function ArbitrageProTerminal() {
  const [running, setRunning] = useState(false)
  const [tab, setTab] = useState<Tab>('trades')
  const [trades, setTrades] = useState<ProTrade[]>([])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setTrades((current) => [createDemoTrade(current.length), ...current].slice(0, 18))
    }, 3500)
    return () => window.clearInterval(timer)
  }, [running])

  const totalReturn = useMemo(() => trades.reduce((sum, trade) => sum + trade.netSpread, 0), [trades])
  const todayReturn = useMemo(() => trades.slice(0, 8).reduce((sum, trade) => sum + trade.netSpread, 0), [trades])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Arbitraj Pro</h1>
          <p className="mt-1 text-sm text-muted-foreground">Otomatik işlem akışının güvenli demo ekranı.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold text-amber-300"><ShieldCheck className="size-3.5" /> Demo / Gerçek emir yok</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ReturnCard label="Son 24 saatin getirisi" amount={todayReturn} live={running} />
        <ReturnCard label="Tüm dönem getirisi" amount={totalReturn} live={running} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(440px,1fr)]">
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <BalanceCard label="Ticaret bakiyesi PRO" action={<Link href="/deposit" className="rounded-md border border-border bg-elevated px-3 py-2 text-xs font-semibold text-foreground hover:border-cyan/60">Faturalar <FileText className="ml-1 inline size-3.5" /></Link>} />
            <BalanceCard label="Gelir bakiyesi PRO" action={<button className="grid size-9 place-items-center rounded-md border border-border bg-elevated text-muted-foreground" aria-label="Bilgi"><Info className="size-4" /></button>} />
          </div>

          <div className="mt-4 grid min-h-[430px] place-items-center rounded-xl border border-cyan/15 bg-[radial-gradient(ellipse_at_top,#0c3235_0%,transparent_58%)] p-6 text-center">
            <div className="max-w-md">
              <span className={cn('mx-auto mb-4 grid size-14 place-items-center rounded-full border', running ? 'border-cyan/60 bg-cyan/10 text-cyan' : 'border-border bg-elevated text-muted-foreground')}><Activity className={cn('size-6', running && 'animate-pulse')} /></span>
              <h2 className="text-base font-semibold text-foreground">{running ? 'Demo otomatik ticaret çalışıyor' : 'Arbitraj Pro demo akışı'}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{running ? 'Yeni demo işlemleri yaklaşık her 3,5 saniyede oluşturulur. İşlem detayları yeni sekmede açılır.' : 'Başlatınca örnek işlemler, tahakkuklar ve operasyonlar oluşturulur. Kullanıcı bakiyesi değişmez.'}</p>
              <button onClick={() => setRunning((value) => !value)} className={cn('mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-primary-foreground', running ? 'bg-destructive hover:bg-destructive/85' : 'velox-gradient')}>
                {running ? <><Pause className="size-4" /> Demo akışını durdur</> : <><Play className="size-4" /> Otomatik ticareti başlat</>}
              </button>
              {!running && trades.length > 0 && <button onClick={() => setTrades([])} className="ml-3 text-xs text-muted-foreground hover:text-foreground">Demo verilerini temizle</button>}
            </div>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex gap-1 border-b border-border p-2">
            <TabButton active={tab === 'trades'} onClick={() => setTab('trades')}>İşlemler</TabButton>
            <TabButton active={tab === 'accruals'} onClick={() => setTab('accruals')}>Tahakkuklar</TabButton>
            <TabButton active={tab === 'operations'} onClick={() => setTab('operations')}>Operasyonlar</TabButton>
          </div>
          <div className="max-h-[545px] overflow-auto p-3">
            {trades.length === 0 ? <EmptyProState /> : tab === 'trades' ? <Trades rows={trades} /> : tab === 'accruals' ? <Accruals rows={trades} /> : <Operations rows={trades} />}
          </div>
        </section>
      </div>
    </div>
  )
}

function ReturnCard({ label, amount, live }: { label: string; amount: number; live: boolean }) {
  return <div className="flex items-center justify-between rounded-xl border border-cyan/25 bg-card px-4 py-3"><span className="text-sm font-semibold text-foreground">{label}</span><span className="inline-flex items-center gap-1.5 font-mono text-base font-bold text-cyan"><TetherIcon className="size-4" /> {formatNumber(amount, 4)} {live && <span className="size-1.5 animate-pulse rounded-full bg-cyan" />}</span></div>
}

function BalanceCard({ label, action }: { label: string; action: React.ReactNode }) {
  return <div className="flex items-start justify-between rounded-lg border border-border bg-elevated/30 p-4"><div><p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 inline-flex items-center gap-2 font-mono text-3xl font-bold text-foreground">0,0000 <TetherIcon className="size-6" /></p></div>{action}</div>
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn('flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors', active ? 'velox-gradient text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>{children}</button>
}

function EmptyProState() {
  return <div className="grid min-h-[440px] place-items-center text-center"><div><span className="mx-auto mb-3 grid size-11 place-items-center rounded-full border border-cyan/40 text-cyan"><Activity className="size-5" /></span><p className="font-semibold text-foreground">Henüz demo işlem yok</p><p className="mt-1 max-w-xs text-sm text-muted-foreground">Soldaki “Otomatik ticareti başlat” düğmesiyle akışı test edebilirsin.</p></div></div>
}

function Trades({ rows }: { rows: ProTrade[] }) {
  return <div className="space-y-2">{rows.map((trade) => <button key={trade.id} onClick={() => openTradeDetail(trade)} className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:border-cyan/45 hover:bg-elevated/70"><div className="flex justify-between gap-3 text-xs text-muted-foreground"><span>{formatDateTime(trade.createdAt)}</span><span>Demo detay ↗</span></div><div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm"><div><p className="text-muted-foreground">Satın al</p><p className="mt-1 font-semibold text-cyan">{trade.buyExchange} <span className="text-foreground">— {formatNumber(trade.buyPrice)}</span></p></div><span className="text-cyan">→</span><div className="text-right"><p className="text-muted-foreground">Sat</p><p className="mt-1 font-semibold text-cyan">{trade.sellExchange} <span className="text-foreground">— {formatNumber(trade.sellPrice)}</span></p></div></div><div className="mt-3 flex justify-between border-t border-border pt-2 text-xs"><span className="text-muted-foreground">Net spread</span><span className="inline-flex items-center gap-1 font-mono font-bold text-cyan"><TetherIcon className="size-3.5" /> +{formatNumber(trade.netSpread, 4)}</span></div></button>)}</div>
}

function Accruals({ rows }: { rows: ProTrade[] }) {
  return <div className="space-y-2">{rows.map((trade) => <button key={trade.id} onClick={() => openTradeDetail(trade)} className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left hover:border-cyan/45 hover:bg-elevated/70"><div><p className="font-semibold text-foreground">Arbitraj tahakkuku</p><p className="mt-1 text-xs text-muted-foreground">{formatDateTime(trade.createdAt)} · Demo TXID</p></div><span className="inline-flex items-center gap-1 font-mono font-bold text-cyan"><TetherIcon className="size-4" /> +{formatNumber(trade.netSpread, 4)}</span></button>)}</div>
}

function Operations({ rows }: { rows: ProTrade[] }) {
  return <div className="space-y-2">{rows.map((trade) => <button key={trade.id} onClick={() => openTradeDetail(trade)} className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left hover:border-cyan/45 hover:bg-elevated/70"><div><p className="font-semibold text-foreground">▲ Demo arbitraj işlemi</p><p className="mt-1 text-xs text-muted-foreground">{formatDateTime(trade.createdAt)} · Dahili demo akışı</p></div><span className="inline-flex items-center gap-1 font-mono font-bold text-cyan"><TetherIcon className="size-4" /> +{formatNumber(trade.netSpread, 4)}</span></button>)}</div>
}
