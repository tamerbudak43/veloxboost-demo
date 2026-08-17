'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MarketDemoModal } from '@/components/velox/arbitrage/market-demo-modal'

export default function MarketDemoPage() {
  return (
    <Suspense fallback={null}>
      <MarketDemoPageContent />
    </Suspense>
  )
}

function MarketDemoPageContent() {
  const router = useRouter()
  const params = useSearchParams()
  const exchange = params.get('exchange') || 'VELOX DEMO'
  const side = params.get('side') === 'sell' ? 'sell' : 'buy'
  const parsedPrice = Number(params.get('price'))
  const basePrice = Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : 2400

  return (
    <MarketDemoModal
      open
      onClose={() => router.back()}
      exchange={exchange}
      side={side}
      basePrice={basePrice}
    />
  )
}
