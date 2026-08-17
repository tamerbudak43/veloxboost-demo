'use client'

import { useMemo, useState } from 'react'
import { CircleCheck, CircleDashed, Layers3, Plus, RefreshCcw, ShieldCheck, Users } from 'lucide-react'
import { TetherIcon } from '@/components/velox/tether-icon'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

const BOOTSTRAP_POOL_COUNT = 10
const BOOTSTRAP_MINIMUM = 10_000
const NORMAL_MINIMUM = 20_000
const POOL_MAXIMUM = 30_000

type Contribution = { id: string; name: string; amount: number }
type Pool = { id: number; amount: number; minimum: number; participants: Contribution[]; createdAt: string }

const initialPending: Contribution[] = [
  { id: 'tamer', name: 'Tamer', amount: 100 },
  { id: 'ahmet', name: 'Ahmet', amount: 1000 },
  { id: 'hakan', name: 'Hakan', amount: 500 },
  { id: 'ayse', name: 'Ayşe', amount: 4000 },
  { id: 'demo-rest', name: 'Diğer demo katılımcıları', amount: 12400 },
]

const initialPools: Pool[] = [
  {
    id: 6,
    amount: 26_000,
    minimum: BOOTSTRAP_MINIMUM,
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    participants: [
      { id: 'active-a', name: 'Demo Katılımcı A', amount: 12000 },
      { id: 'active-b', name: 'Demo Katılımcı B', amount: 9000 },
      { id: 'active-c', name: 'Demo Katılımcı C', amount: 5000 },
    ],
  },
]

const sum = (entries: Contribution[]) => entries.reduce((total, entry) => total + entry.amount, 0)

function poolMinimum(poolNumber: number) {
  return poolNumber <= BOOTSTRAP_POOL_COUNT ? BOOTSTRAP_MINIMUM : NORMAL_MINIMUM
}

function splitForPool(entries: Contribution[], capacity: number) {
  let remainingCapacity = capacity
  const included: Contribution[] = []
  const remainder: Contribution[] = []

  for (const entry of entries) {
    if (remainingCapacity <= 0) {
      remainder.push(entry)
      continue
    }
    const accepted = Math.min(entry.amount, remainingCapacity)
    if (accepted > 0) included.push({ ...entry, amount: accepted })
    if (entry.amount > accepted) remainder.push({ ...entry, amount: entry.amount - accepted })
    remainingCapacity -= accepted
  }
  return { included, remainder }
}

export function ArbitragePoolsDemo() {
  const [pools, setPools] = useState<Pool[]>(initialPools)
  const [pending, setPending] = useState<Contribution[]>(initialPending)
  const [name, setName] = useState('Oğuz')
  const [amount, setAmount] = useState('8000')
  const [notice, setNotice] = useState('Bekleyen havuz 18.000 USDT. Oğuz için 8.000 girerek 26.000 USDT havuz senaryosunu test edebilirsin.')

  const pendingTotal = sum(pending)
  const nextPoolNumber = (pools.at(-1)?.id ?? 0) + 1
  const nextMinimum = poolMinimum(nextPoolNumber)
  const overallTotal = pools.reduce((total, pool) => total + pool.amount, 0) + pendingTotal

  const addContribution = () => {
    const parsedAmount = Number(amount.replace(',', '.'))
    const trimmedName = name.trim()
    if (!trimmedName || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setNotice('Demo için geçerli bir katılımcı adı ve pozitif tutar gir.')
      return
    }

    let working = [...pending, { id: `demo-${Date.now()}`, name: trimmedName, amount: parsedAmount }]
    const created: Pool[] = []
    let currentPoolNumber = nextPoolNumber

    while (sum(working) >= poolMinimum(currentPoolNumber)) {
      const { included, remainder } = splitForPool(working, POOL_MAXIMUM)
      const poolAmount = sum(included)
      created.push({
        id: currentPoolNumber,
        amount: poolAmount,
        minimum: poolMinimum(currentPoolNumber),
        participants: included,
        createdAt: new Date().toISOString(),
      })
      working = remainder
      currentPoolNumber += 1
    }

    setPools((current) => [...current, ...created])
    setPending(working)
    setNotice(
      created.length > 0
        ? `Havuz ${created.map((pool) => `#${pool.id}`).join(', ')} oluşturuldu. ${created.map((pool) => formatNumber(pool.amount, 0)).join(' / ')} USDT hacimle kilitlendi; kalan tutar yeni bekleyen havuza geçti.`
        : `Yatırım bekleyen havuza eklendi. Havuz oluşması için ${formatNumber(Math.max(0, nextMinimum - sum(working)), 0)} USDT daha gerekiyor.`,
    )
  }

  const reset = () => {
    setPools(initialPools)
    setPending(initialPending)
    setName('Oğuz')
    setAmount('8000')
    setNotice('Demo başlangıcına dönüldü: bekleyen havuz 18.000 USDT.')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-xl font-bold text-foreground">Arbitraj Havuzları</h1><p className="mt-1 text-sm text-muted-foreground">Başlangıçta 10–30 bin; ilk 10 havuzdan sonra 20–30 bin USDT kuralı.</p></div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold text-amber-300"><ShieldCheck className="size-3.5" /> Demo / Gerçek fon yok</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Stat icon={<Layers3 />} label="Aktif havuz" value={String(pools.length)} />
        <Stat icon={<CircleDashed />} label="Bekleyen havuz" value={formatNumber(pendingTotal, 0)} tether />
        <Stat icon={<Users />} label="Toplam demo hacmi" value={formatNumber(overallTotal, 0)} tether />
        <Stat icon={<CircleCheck />} label="Sonraki havuz kuralı" value={`${formatNumber(nextMinimum, 0)}–${formatNumber(POOL_MAXIMUM, 0)}`} tether />
      </div>

      <section className="rounded-xl border border-cyan/25 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold text-foreground">Bekleyen havuz #{nextPoolNumber}</h2><p className="mt-1 text-xs text-muted-foreground">{nextPoolNumber <= BOOTSTRAP_POOL_COUNT ? `Başlangıç dönemi: ${formatNumber(BOOTSTRAP_MINIMUM, 0)}–${formatNumber(POOL_MAXIMUM, 0)}` : `Normal dönem: ${formatNumber(NORMAL_MINIMUM, 0)}–${formatNumber(POOL_MAXIMUM, 0)}`} USDT</p></div><button onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><RefreshCcw className="size-3.5" /> Demo sıfırla</button></div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-elevated"><div className="h-full rounded-full velox-gradient transition-[width] duration-500" style={{ width: `${Math.min(100, (pendingTotal / nextMinimum) * 100)}%` }} /></div>
        <div className="mt-2 flex justify-between text-xs"><span className="font-mono text-cyan"><TetherIcon className="mr-1 inline size-3.5" />{formatNumber(pendingTotal, 0)}</span><span className="text-muted-foreground">Havuz eşiği: {formatNumber(nextMinimum, 0)}</span></div>
        <p className="mt-4 rounded-lg border border-cyan/20 bg-cyan/5 p-3 text-sm text-cyan">{notice}</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_150px_auto]"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Katılımcı adı" className="h-10 rounded-md border border-input bg-elevated px-3 text-sm outline-none focus:border-cyan" /><input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="USDT" className="h-10 rounded-md border border-input bg-elevated px-3 font-mono text-sm outline-none focus:border-cyan" /><button onClick={addContribution} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md velox-gradient px-4 text-sm font-semibold text-primary-foreground"><Plus className="size-4" /> Demo yatırımı ekle</button></div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3"><h2 className="text-sm font-semibold text-foreground">Aktif havuzlar</h2>{pools.slice().reverse().map((pool) => <PoolCard key={pool.id} pool={pool} />)}</section>
        <section className="rounded-xl border border-border bg-card p-4"><h2 className="text-sm font-semibold text-foreground">Bekleyen katılımcılar</h2><p className="mt-1 text-xs text-muted-foreground">Bu kayıtlar havuz oluşana kadar bekler; aktif havuza sonradan eklenmez.</p><div className="mt-4 space-y-2">{pending.map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border bg-elevated/40 px-3 py-2.5"><span className="text-sm text-foreground">{entry.name}</span><span className="inline-flex items-center gap-1 font-mono text-sm font-semibold text-cyan"><TetherIcon className="size-3.5" />{formatNumber(entry.amount, 0)}</span></div>)}</div></section>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, tether = false }: { icon: React.ReactNode; label: string; value: string; tether?: boolean }) {
  return <div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2 text-muted-foreground"><span className="text-cyan">{icon}</span><span className="text-[10px] uppercase tracking-wider">{label}</span></div><p className="mt-3 inline-flex items-center gap-1.5 font-mono text-lg font-bold text-foreground">{tether && <TetherIcon className="size-4" />}{value}</p></div>
}

function PoolCard({ pool }: { pool: Pool }) {
  return <article className="rounded-xl border border-border bg-card p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Havuz numarası</p><h3 className="mt-1 text-lg font-bold text-foreground">#{pool.id} <span className="ml-2 text-xs font-medium text-cyan">AKTİF</span></h3></div><div className="text-right"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Kilitleme hacmi</p><p className="mt-1 inline-flex items-center gap-1.5 font-mono text-lg font-bold text-cyan"><TetherIcon className="size-4" />{formatNumber(pool.amount, 0)}</p></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-elevated"><div className="h-full rounded-full velox-gradient" style={{ width: `${(pool.amount / POOL_MAXIMUM) * 100}%` }} /></div><div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>Oluşum eşiği: {formatNumber(pool.minimum, 0)}</span><span>Üst limit: {formatNumber(POOL_MAXIMUM, 0)}</span><span>{pool.participants.length} katılımcı</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{pool.participants.map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-md bg-elevated/50 px-3 py-2 text-xs"><span className="text-secondary-foreground">{entry.name}</span><span className="font-mono text-foreground">{formatNumber(entry.amount, 0)} · %{formatNumber((entry.amount / pool.amount) * 100, 2)}</span></div>)}</div></article>
}
