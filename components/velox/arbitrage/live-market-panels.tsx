'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import { TradePanel } from './trade-panel'
import type { MarketOffer } from '@/lib/types'

type LiveMarketPanelsProps = {
  buyExchange: string
  sellExchange: string
  tradingBalance: number
  totalPool: number
  buyOffers: MarketOffer[]
  sellOffers: MarketOffer[]
}

function number(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function nextOffers(offers: MarketOffer[], direction: -1 | 1) {
  return offers.map((offer, index) => {
    const price = number(offer.ethPrice)
    const volume = Math.max(1, number(offer.usdtVolume))
    const movement = (Math.random() - 0.5) * 1.6 + direction * 0.08
    const nextPrice = Math.max(1, price + movement)
    const nextVolume = Math.max(1, volume * (0.96 + Math.random() * 0.08))

    return {
      ...offer,
      id: offer.id || `offer-${index}`,
      ethPrice: Number(nextPrice.toFixed(2)),
      usdtVolume: Number(nextVolume.toFixed(2)),
      ethVolume: Number((nextVolume / nextPrice).toFixed(4)),
    }
  })
}

/**
 * Visual market simulator only. It deliberately never places an order, talks
 * to an exchange, or changes a user's balance.
 */
export function LiveMarketPanels(props: LiveMarketPanelsProps) {
  const [buyOffers, setBuyOffers] = useState(props.buyOffers)
  const [sellOffers, setSellOffers] = useState(props.sellOffers)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setBuyOffers(props.buyOffers)
    setSellOffers(props.sellOffers)
  }, [props.buyOffers, props.sellOffers])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBuyOffers((current) => nextOffers(current, -1))
      setSellOffers((current) => nextOffers(current, 1))
      setTick((current) => current + 1)
    }, 1600)

    return () => window.clearInterval(timer)
  }, [])

  const label = useMemo(() => `Güncelleme #${tick + 1}`, [tick])

  return (
    <section aria-label="Canlı piyasa simülasyonu">
      <div className="mb-2 flex items-center justify-end gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan">
          <Activity className="size-3 animate-pulse" />
          Canlı simülasyon
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TradePanel
          side="buy"
          exchange={props.buyExchange}
          myAsset={props.tradingBalance}
          totalPool={props.totalPool}
          offers={buyOffers}
          simulationTick={tick}
        />
        <TradePanel
          side="sell"
          exchange={props.sellExchange}
          myAsset={props.tradingBalance}
          totalPool={props.totalPool}
          offers={sellOffers}
          simulationTick={tick}
        />
      </div>
    </section>
  )
}
