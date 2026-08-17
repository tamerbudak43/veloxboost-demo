'use client'

import { Suspense, useMemo } from 'react'
import { ArrowRight, CheckCircle2, Copy, ExternalLink, ShieldCheck } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDateTime, formatNumber, safeNumber } from '@/lib/format'
import { TetherIcon } from '@/components/velox/tether-icon'

function demoHash(input: string) {
  let state = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    state ^= input.charCodeAt(index)
    state = Math.imul(state, 16777619)
  }
  let value = state >>> 0
  let result = ''
  for (let index = 0; index < 64; index += 1) {
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    result += (value >>> 0).toString(16).slice(-1)
  }
  return `0x${result}`
}

export default function TradeDemoPage() {
  return <Suspense fallback={null}><TradeDemoContent /></Suspense>
}

function TradeDemoContent() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id') || 'demo-trade'
  const buyExchange = params.get('buyExchange') || 'BITCIARZ'
  const sellExchange = params.get('sellExchange') || 'CXI'
  const buyPrice = safeNumber(params.get('buyPrice'))
  const sellPrice = safeNumber(params.get('sellPrice'))
  const volume = safeNumber(params.get('volume'))
  const spread = safeNumber(params.get('spread'))
  const createdAt = params.get('createdAt') || new Date().toISOString()
  const txid = useMemo(() => demoHash(`${id}:${buyExchange}:${sellExchange}:${createdAt}`), [id, buyExchange, sellExchange, createdAt])

  const copyTxid = async () => {
    await navigator.clipboard?.writeText(txid)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[#111817] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-4xl">
        <button onClick={() => router.back()} className="mb-5 text-sm text-cyan hover:underline">← Arbitraja dön</button>
        <section className="overflow-hidden rounded-xl border border-cyan/25 bg-[#1c2020] shadow-2xl shadow-black/30">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#222727] px-5 py-4">
            <div><p className="text-lg font-bold">İşlem ayrıntısı</p><p className="mt-1 text-xs text-slate-400">ETH / USDT · Piyasa simülasyonu</p></div>
            <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">Simülasyon</span>
          </header>
          <div className="p-5 sm:p-7">
            <div className="mb-6 grid gap-3 sm:grid-cols-3"><Detail label="İşlem zamanı" value={formatDateTime(createdAt)} /><Detail label="İşlem durumu" value="Tamamlandı" good /><Detail label="İşlem kimliği" value={id} /></div>
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-[#151a1a] p-6 text-center sm:flex-row">
              <div><p className="text-xs text-slate-400">Alış borsası</p><p className="mt-1 font-bold text-cyan">{buyExchange}</p><p className="mt-2 font-mono text-lg">{formatNumber(buyPrice)}</p></div>
              <ArrowRight className="size-7 text-cyan" />
              <div><p className="text-xs text-slate-400">Satış borsası</p><p className="mt-1 font-bold text-emerald-400">{sellExchange}</p><p className="mt-2 font-mono text-lg">{formatNumber(sellPrice)}</p></div>
            </div>
            <div className="my-6 grid gap-3 sm:grid-cols-3"><Detail label="ETH hacmi" value={formatNumber(volume, 4)} /><Detail label="Net spread" value={formatNumber(spread, 4)} good /><Detail label="Varlık" value={<span className="inline-flex items-center gap-1.5"><TetherIcon className="size-4" /> USDT</span>} /></div>
            <div className="rounded-xl border border-amber-300/25 bg-amber-300/5 p-4"><div className="mb-2 flex items-center gap-2 text-amber-200"><ShieldCheck className="size-5" /><span className="font-semibold">Simülasyon TXID</span></div><p className="mb-3 text-xs text-amber-100/80">Bu örnek ekran için üretilen tanımlayıcıdır; zincirde yayınlanmış gerçek bir işlem hash’i değildir.</p><div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-3"><code className="min-w-0 flex-1 break-all font-mono text-xs text-slate-200">{txid}</code><button onClick={copyTxid} className="shrink-0 rounded-md border border-white/15 p-2 text-cyan hover:bg-white/10" aria-label="Simülasyon TXID kopyala"><Copy className="size-4" /></button></div></div>
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-cyan/20 bg-cyan/5 p-3 text-xs text-cyan"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> Gerçek borsa veya zincir bağlantısı eklendiğinde bu alanda borsadan ya da blokzincirden doğrulanmış gerçek işlem numarası gösterilir. <ExternalLink className="ml-auto mt-0.5 size-3 shrink-0" /></div>
          </div>
        </section>
      </div>
    </div>
  )
}

function Detail({ label, value, good = false }: { label: string; value: React.ReactNode; good?: boolean }) {
  return <div className="rounded-lg border border-white/10 bg-[#151a1a] p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className={`mt-1.5 text-sm font-semibold ${good ? 'text-emerald-400' : 'text-white'}`}>{value}</p></div>
}
