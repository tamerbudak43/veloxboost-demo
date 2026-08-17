import { Building2, CircleCheck, Droplets, Globe2, Landmark, ShieldCheck } from 'lucide-react'
import { TetherIcon } from '@/components/velox/tether-icon'
import { Panel, PanelHeader, StatusPill } from '@/components/velox/primitives'
import { formatNumber } from '@/lib/format'

type ProviderGroup = {
  region: string
  regionLabel: string
  partner: string
  venues: Array<{ name: string; location: string; capacity: number }>
}

const providerGroups: ProviderGroup[] = [
  {
    region: 'Asya',
    regionLabel: 'Likidite sağlayıcısı · Asya',
    partner: 'CX1',
    venues: [
      { name: 'KuCoin', location: 'Singapur', capacity: 6_600_000 },
      { name: 'Indodax', location: 'Endonezya', capacity: 3_600_000 },
      { name: 'Rain', location: 'Bahreyn', capacity: 4_000_000 },
    ],
  },
  {
    region: 'Afrika',
    regionLabel: 'Likidite sağlayıcısı · Afrika',
    partner: 'NEXORA',
    venues: [
      { name: 'Bitunix', location: 'BAE', capacity: 4_000_000 },
      { name: 'Bitget', location: 'BAE', capacity: 6_600_000 },
      { name: 'BingX', location: 'Nijerya', capacity: 4_000_000 },
    ],
  },
  {
    region: 'Avrupa',
    regionLabel: 'Likidite sağlayıcısı · Avrupa',
    partner: 'BITCLARZ',
    venues: [
      { name: 'Binance', location: 'Cayman Adaları', capacity: 8_000_000 },
      { name: 'Bybit', location: 'BVI', capacity: 6_000_000 },
      { name: 'OKX', location: 'Seyşeller', capacity: 9_000_000 },
    ],
  },
]

const totalCapacity = providerGroups.flatMap((group) => group.venues).reduce((sum, venue) => sum + venue.capacity, 0)

export function LiquidityView() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
            <Droplets className="size-5 text-cyan" /> Likidite
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            VELOX demo arbitraj terminali için bölgesel likidite görünümü.
          </p>
        </div>
        <StatusPill tone="warning">
          <ShieldCheck className="size-3.5" /> Demo veri · Gerçek borsa bağlantısı yok
        </StatusPill>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Landmark />} label="Likidite sağlayıcısı" value={String(providerGroups.length)} hint="Bölgesel demo partner" />
        <Metric icon={<Building2 />} label="Borsa bağlantısı" value="9" hint="Demo erişim noktası" />
        <Metric icon={<TetherIcon className="size-4" />} label="Gösterilen kapasite" value={formatNumber(totalCapacity, 0)} hint="USDT eşdeğeri" accent />
        <Metric icon={<Globe2 />} label="Kapsanan bölge" value="3" hint="Asya · Afrika · Avrupa" />
      </div>

      <div className="space-y-3">
        {providerGroups.map((group) => (
          <ProviderCard key={group.region} group={group} />
        ))}
      </div>

      <p className="px-1 text-center text-xs text-muted-foreground">
        Bu ekrandaki tüm kurum, kapasite ve USDT değerleri yalnızca ürün arayüzü demosu içindir; yatırım, cüzdan, alım-satım veya gerçek para işlemi yapılmaz.
      </p>
    </div>
  )
}

function Metric({ icon, label, value, hint, accent = false }: { icon: React.ReactNode; label: string; value: string; hint: string; accent?: boolean }) {
  return (
    <Panel className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-cyan">{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.13em]">{label}</span>
      </div>
      <div className={accent ? 'mt-2 font-mono text-xl font-semibold velox-gradient-text' : 'mt-2 font-mono text-xl font-semibold text-foreground'}>{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Panel>
  )
}

function ProviderCard({ group }: { group: ProviderGroup }) {
  const groupCapacity = group.venues.reduce((sum, venue) => sum + venue.capacity, 0)

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title={<span className="text-sm font-semibold">{group.region}</span>}
        right={<span className="text-xs font-semibold tracking-wide text-cyan">{group.partner} <CircleCheck className="ml-1 inline size-3.5" /></span>}
      />
      <div className="px-4 py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{group.regionLabel}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Bölgesel piyasa derinliği ve rota görünümü</p>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-cyan">
            <TetherIcon className="size-4" /> {formatNumber(groupCapacity, 0)} USDT
          </span>
        </div>

        <div className="divide-y divide-border">
          {group.venues.map((venue) => (
            <div key={venue.name} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-foreground">{venue.name} <span className="text-xs font-normal text-muted-foreground">({venue.location})</span></p>
              </div>
              <div className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-secondary-foreground">
                <TetherIcon className="size-3.5 text-cyan" /> {formatNumber(venue.capacity, 0)} <span className="text-xs font-normal text-muted-foreground">USDT</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
