'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, ChevronDown, Maximize2, Search, X } from 'lucide-react'
import { TetherIcon } from '@/components/velox/tether-icon'
import { cn } from '@/lib/utils'

type Candle = { open: number; close: number; high: number; low: number; volume: number }

function makeCandles(seed: number) {
  let current = seed
  return Array.from({ length: 58 }, () => {
    const open = current
    const close = Math.max(1, open + (Math.random() - 0.5) * 5.5)
    const high = Math.max(open, close) + Math.random() * 2.4
    const low = Math.min(open, close) - Math.random() * 2.4
    current = close
    return { open, close, high, low, volume: 18 + Math.random() * 120 }
  })
}

function format(value: number, decimals = 2) {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function CandlestickChart({ candles }: { candles: Candle[] }) {
  const prices = candles.flatMap((c) => [c.low, c.high])
  const min = Math.min(...prices) - 1
  const max = Math.max(...prices) + 1
  const height = 310
  const chartHeight = 226
  const width = 1000
  const xStep = width / candles.length
  const priceY = (value: number) => 18 + ((max - value) / (max - min)) * (chartHeight - 24)
  const maxVolume = Math.max(...candles.map((c) => c.volume))

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0b0f0e]">
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-[310px] w-full" role="img" aria-label="Demo fiyat grafiği">
        {Array.from({ length: 8 }, (_, index) => {
          const y = 18 + (index * (chartHeight - 24)) / 7
          return <line key={`h-${index}`} x1="0" x2={width} y1={y} y2={y} stroke="#28302e" strokeWidth="1" />
        })}
        {Array.from({ length: 11 }, (_, index) => {
          const x = (index * width) / 10
          return <line key={`v-${index}`} x1={x} x2={x} y1="0" y2={chartHeight} stroke="#222927" strokeWidth="1" />
        })}
        {candles.map((candle, index) => {
          const x = index * xStep + xStep / 2
          const rising = candle.close >= candle.open
          const color = rising ? '#21d7b4' : '#f34f7d'
          const openY = priceY(candle.open)
          const closeY = priceY(candle.close)
          const bodyTop = Math.min(openY, closeY)
          const bodyHeight = Math.max(2, Math.abs(closeY - openY))
          const volumeHeight = (candle.volume / maxVolume) * 60
          return (
            <g key={index}>
              <line x1={x} x2={x} y1={priceY(candle.high)} y2={priceY(candle.low)} stroke={color} strokeWidth="1.2" />
              <rect x={x - xStep * 0.28} y={bodyTop} width={xStep * 0.56} height={bodyHeight} fill={color} rx="1" />
              <rect x={x - xStep * 0.28} y={296 - volumeHeight} width={xStep * 0.56} height={volumeHeight} fill={rising ? '#7db6e8' : '#7d8795'} opacity="0.85" />
            </g>
          )
        })}
        <text x={width - 6} y="30" textAnchor="end" fill="#9ca9a6" fontSize="12">{format(max)}</text>
        <text x={width - 6} y={chartHeight - 8} textAnchor="end" fill="#9ca9a6" fontSize="12">{format(min)}</text>
      </svg>
    </div>
  )
}

export function MarketDemoModal({
  open,
  onClose,
  exchange,
  side,
  basePrice,
}: {
  open: boolean
  onClose: () => void
  exchange: string
  side: 'buy' | 'sell'
  basePrice: number
}) {
  const [price, setPrice] = useState(basePrice)
  const [candles, setCandles] = useState<Candle[]>(() => makeCandles(basePrice))

  useEffect(() => {
    if (!open) return
    setPrice(basePrice)
    setCandles(makeCandles(basePrice))
  }, [open, basePrice])

  useEffect(() => {
    if (!open) return
    const timer = window.setInterval(() => {
      setPrice((current) => Math.max(1, Number((current + (Math.random() - 0.48) * 1.8).toFixed(2))))
      setCandles((current) => {
        const next = current.slice(1)
        const openPrice = current.at(-1)?.close ?? basePrice
        const close = Math.max(1, openPrice + (Math.random() - 0.48) * 2.2)
        next.push({
          open: openPrice,
          close,
          high: Math.max(openPrice, close) + Math.random() * 1.2,
          low: Math.min(openPrice, close) - Math.random() * 1.2,
          volume: 18 + Math.random() * 120,
        })
        return next
      })
    }, 1600)
    return () => window.clearInterval(timer)
  }, [open, basePrice])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const rows = useMemo(
    () => Array.from({ length: 9 }, (_, index) => {
      const spread = (index + 1) * 0.42
      const amount = 0.18 + Math.random() * 3.4
      return {
        price: side === 'buy' ? price - spread : price + spread,
        amount,
        volume: amount * price,
      }
    }),
    [price, side],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Piyasa demo ekranı">
      <div className="flex h-[min(900px,94vh)] w-full max-w-[1500px] flex-col overflow-hidden rounded-xl border border-cyan/25 bg-[#171717] shadow-2xl shadow-cyan/10">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#202020] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded bg-cyan/15 text-cyan"><BarChart3 className="size-5" /></div>
            <div>
              <p className="text-sm font-bold text-white">{exchange}</p>
              <p className="text-[11px] text-slate-400">ETH / USDT — Piyasa ekranı</p>
            </div>
            <span className="ml-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">Demo</span>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-md border border-white/10 text-slate-300 hover:bg-white/10" aria-label="Demo ekranını kapat"><X className="size-5" /></button>
        </header>

        <div className="grid grid-cols-2 gap-px border-b border-white/10 bg-white/10 sm:grid-cols-5">
          <Metric label="Son fiyat" value={format(price)} />
          <Metric label="Günlük değişim" value="+0,42%" positive />
          <Metric label="Günlük yüksek" value={format(price + 14.2)} />
          <Metric label="Günlük düşük" value={format(price - 18.5)} />
          <Metric label="24s hacim" value="1.023.627.747" />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_310px]">
          <aside className="border-b border-white/10 bg-[#202020] p-3 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-white">Piyasalar</span><Search className="size-4 text-slate-400" /></div>
            {['ETH', 'BTC', 'TRX', 'XRP', 'BNB', 'LTC'].map((coin, index) => (
              <div key={coin} className="grid grid-cols-[1fr_auto] gap-x-2 border-b border-white/5 py-2 text-xs">
                <span className="font-semibold text-white">{coin}</span>
                <span className={index % 3 === 0 ? 'text-rose-400' : 'text-emerald-400'}>{format(price * (coin === 'ETH' ? 1 : 0.9 + index * 0.6))}</span>
                <span className="col-span-2 mt-0.5 text-[10px] text-slate-500">USDT · Simülasyon</span>
              </div>
            ))}
          </aside>

          <main className="min-h-0 overflow-auto bg-[#181818] p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-1"><span className="rounded bg-white/10 px-2 py-1 text-xs font-semibold text-white">1m</span>{['5m', '15m', '1h', '4h', '1g'].map((item) => <span className="px-2 py-1 text-xs text-slate-400" key={item}>{item}</span>)}</div><span className="inline-flex items-center gap-1 text-[10px] text-amber-300"><span className="size-1.5 animate-pulse rounded-full bg-amber-300" /> Yapay demo akışı</span></div>
            <CandlestickChart candles={candles} />
            <div className="mt-3 rounded-lg border border-white/10"><div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-cyan">Demo işlemler</div><div className="grid grid-cols-5 gap-2 px-3 py-2 text-[10px] uppercase text-slate-500"><span>Çift</span><span>Taraf</span><span>Fiyat</span><span>Miktar</span><span className="text-right">Durum</span></div>{rows.slice(0, 5).map((row, index) => <div className="grid grid-cols-5 gap-2 border-t border-white/5 px-3 py-2 font-mono text-xs" key={index}><span className="text-white">ETH/<span className="text-cyan">USDT</span></span><span className={side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}>{side === 'buy' ? 'AL' : 'SAT'}</span><span className="text-white">{format(row.price)}</span><span className="text-slate-300">{format(row.amount, 4)}</span><span className="text-right text-emerald-400">Simüle</span></div>)}</div>
          </main>

          <aside className="min-h-0 overflow-auto border-t border-white/10 bg-[#202020] p-3 lg:border-l lg:border-t-0">
            <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-white">Emir defteri</span><span className="inline-flex items-center gap-1 text-[10px] text-cyan"><TetherIcon className="size-3" /> USDT</span></div>
            <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-2 text-[10px] uppercase text-slate-500"><span>Fiyat</span><span>Miktar</span><span className="text-right">Hacim</span></div>
            {rows.slice(0, 5).reverse().map((row, index) => <OrderRow key={`sell-${index}`} row={row} tone="sell" />)}
            <div className="my-3 flex items-center gap-2 font-mono text-lg font-bold text-white"><span>{format(price)}</span><span className="text-xs text-cyan">USDT</span><ChevronDown className="size-4 text-rose-400" /></div>
            {rows.slice(4).map((row, index) => <OrderRow key={`buy-${index}`} row={row} tone="buy" />)}
            <div className="mt-4 border-t border-white/10 pt-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-white">Son işlemler</span><Maximize2 className="size-3 text-slate-500" /></div>{rows.slice(0, 5).map((row, index) => <div key={index} className="grid grid-cols-3 gap-2 py-1 font-mono text-[11px]"><span className={index % 2 ? 'text-rose-400' : 'text-emerald-400'}>{format(row.price)}</span><span className="text-slate-300">{format(row.amount, 4)}</span><span className="text-right text-slate-500">Şimdi</span></div>)}</div>
          </aside>
        </div>
        <footer className="border-t border-amber-300/20 bg-amber-300/5 px-4 py-2 text-center text-[11px] text-amber-200">Bu ekran yalnızca kullanıcı arayüzü ve akış testidir. Gerçek borsa verisi, emir iletimi veya yatırım hizmeti sağlamaz.</footer>
      </div>
    </div>
  )
}

function Metric({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return <div className="bg-[#202020] px-4 py-2.5"><p className="text-[10px] text-slate-400">{label}</p><p className={cn('mt-1 font-mono text-sm font-bold text-white', positive && 'text-emerald-400')}>{value} <span className="text-[10px]">USDT</span></p></div>
}

function OrderRow({ row, tone }: { row: { price: number; amount: number; volume: number }; tone: 'buy' | 'sell' }) {
  return <div className="grid grid-cols-3 gap-2 py-1.5 font-mono text-[11px]"><span className={tone === 'buy' ? 'text-emerald-400' : 'text-rose-400'}>{format(row.price)}</span><span className="text-slate-300">{format(row.amount, 4)}</span><span className="text-right text-slate-400">{format(row.volume, 0)}</span></div>
}
