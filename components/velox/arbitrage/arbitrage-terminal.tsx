import { BalanceSummary } from './balance-summary'
import { PhaseCountdown } from './countdown'
import { TradeHistory } from './trade-history'
import { LiveMarketPanels } from './live-market-panels'
import type {
  Accrual,
  ArbitrageBalance,
  ArbitragePhase,
  ArbitrageTrade,
  MarketOffer,
  Operation,
} from '@/lib/types'

export interface ArbitrageTerminalData {
  balance: ArbitrageBalance
  phase: ArbitragePhase
  buyExchange: string
  sellExchange: string
  totalPool: number
  buyOffers: MarketOffer[]
  sellOffers: MarketOffer[]
  trades: ArbitrageTrade[]
  accruals: Accrual[]
  operations: Operation[]
}

export function ArbitrageTerminal({ data }: { data: ArbitrageTerminalData }) {
  const tradingBalance = data?.balance?.tradingBalance ?? 0

  return (
    <div className="space-y-4">
      <BalanceSummary balance={data.balance} />

      <PhaseCountdown phase={data.phase} />

      <LiveMarketPanels
        buyExchange={data.buyExchange}
        sellExchange={data.sellExchange}
        tradingBalance={tradingBalance}
        totalPool={data.totalPool}
        buyOffers={data.buyOffers}
        sellOffers={data.sellOffers}
      />

      <TradeHistory
        trades={data.trades}
        accruals={data.accruals}
        operations={data.operations}
      />
    </div>
  )
}
