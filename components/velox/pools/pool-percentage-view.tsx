import { Activity, BadgeDollarSign, Bitcoin, Clock3, Info, ShieldCheck } from 'lucide-react'
import { TetherIcon } from '@/components/velox/tether-icon'
import { Panel, StatusPill } from '@/components/velox/primitives'

type PoolTier = {
  name: string
  duration: string
  range: string
  performance: string
}

type AssetPool = {
  symbol: string
  name: string
  price: string
  arbitraj: string
  pro: string
  icon: 'usdt' | 'btc'
  tiers: PoolTier[]
}

const assetPools: AssetPool[] = [
  {
    symbol: 'USDT',
    name: 'Tether USDT',
    price: '1,00 USDT',
    arbitraj: '%0,9',
    pro: '%2,2',
    icon: 'usdt',
    tiers: [
      { name: 'Havuz Standard', duration: '50–95 dakika', range: '100–10.000 USDT', performance: '%0,9–%1,4' },
      { name: 'Havuz Plus', duration: '50–75 dakika', range: '10.000–50.000 USDT', performance: '%1,3–%1,9' },
      { name: 'Havuz Prime', duration: '50–65 dakika', range: '50.000–100.000 USDT', performance: '%1,7–%2,3' },
      { name: 'Havuz Pro', duration: '50–60 dakika', range: '100.000+ USDT', performance: '%2,2–%3,7' },
    ],
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: '64.119,85 USDT',
    arbitraj: '%1,9',
    pro: '%3,08',
    icon: 'btc',
    tiers: [
      { name: 'Havuz Standard', duration: '60–100 dakika', range: '0,10–0,25 BTC', performance: '%1,9–%2,4' },
      { name: 'Havuz Plus', duration: '60–85 dakika', range: '0,25–1 BTC', performance: '%2,2–%3,1' },
      { name: 'Havuz Prime', duration: '50–70 dakika', range: '1–2 BTC', performance: '%2,9–%4,0' },
      { name: 'Havuz Pro', duration: '40–60 dakika', range: '2+ BTC', performance: '%3,8–%6,2' },
    ],
  },
]

export function PoolPercentageView() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
            <BadgeDollarSign className="size-5 text-cyan" /> Havuz Yüzdesi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Varlık ve havuz seviyesi bazında demo senaryo görünümü.</p>
        </div>
        <StatusPill tone="warning"><ShieldCheck className="size-3.5" /> Demo simülasyonu · Gerçek yatırım veya getiri yok</StatusPill>
      </div>

      <div className="rounded-lg border border-cyan/25 bg-cyan/5 px-4 py-3 text-sm text-cyan">
        <Info className="mr-2 inline size-4" /> Gösterilen süreler, tutar aralıkları ve performans bantları yalnızca arayüz senaryosudur; finansal vaat veya gerçek zamanlı piyasa verisi değildir.
      </div>

      {assetPools.map((asset) => <AssetPoolCard key={asset.symbol} asset={asset} />)}
    </div>
  )
}

function AssetPoolCard({ asset }: { asset: AssetPool }) {
  const icon = asset.icon === 'usdt'
    ? <TetherIcon className="size-5" />
    : <Bitcoin className="size-5" />

  return (
    <Panel className="overflow-hidden">
      <div className="grid gap-4 border-b border-border bg-surface/40 px-4 py-4 lg:grid-cols-[minmax(190px,1fr)_minmax(170px,0.8fr)_minmax(160px,0.7fr)_auto] lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">{icon}</div>
          <div><p className="font-semibold text-foreground">{asset.name}</p><p className="text-xs text-muted-foreground">{asset.symbol}</p></div>
        </div>
        <div><p className="font-mono text-base font-semibold text-foreground">{asset.price}</p><p className="mt-0.5 text-xs text-muted-foreground">Demo referans fiyatı</p></div>
        <div><StatusPill tone="success"><Activity className="size-3" /> Simülasyon</StatusPill></div>
        <div className="flex gap-5 lg:text-right">
          <div><p className="font-mono text-sm font-semibold text-cyan">Arb {asset.arbitraj}</p><p className="mt-0.5 text-[10px] text-muted-foreground">Demo bandı</p></div>
          <div><p className="font-mono text-sm font-semibold text-light-cyan">Pro {asset.pro}</p><p className="mt-0.5 text-[10px] text-muted-foreground">Demo bandı</p></div>
        </div>
      </div>

      <div className="divide-y divide-border px-4">
        {asset.tiers.map((tier) => <TierRow key={tier.name} tier={tier} />)}
      </div>
    </Panel>
  )
}

function TierRow({ tier }: { tier: PoolTier }) {
  return (
    <div className="grid gap-3 py-3.5 sm:grid-cols-[175px_minmax(190px,1fr)_220px_160px] sm:items-center">
      <span className="inline-flex w-fit rounded-md border border-cyan/40 bg-cyan/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-cyan">{tier.name}</span>
      <span className="inline-flex items-center gap-1.5 text-sm text-secondary-foreground"><Clock3 className="size-4 text-muted-foreground" /> İşlem süresi: <strong className="font-medium text-foreground">{tier.duration}</strong></span>
      <span className="rounded-md bg-elevated/75 px-3 py-1.5 text-center font-mono text-sm font-semibold text-foreground">{tier.range}</span>
      <span className="text-sm text-secondary-foreground sm:text-right">Demo performans bandı: <strong className="font-mono font-semibold text-cyan">{tier.performance}</strong></span>
    </div>
  )
}
