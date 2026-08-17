/**
 * Arbitrage service layer.
 * This is the seam where real database queries will live. For now it returns
 * safe demo data from the centralized demo module. Financial truth must live
 * here (server side), never in React component state.
 */

import type { ArbitrageTerminalData } from '@/components/velox/arbitrage/arbitrage-terminal'
import {
  demoAccruals,
  demoBalance,
  demoBuyOffers,
  demoOperations,
  demoPhase,
  demoSellOffers,
  demoTotalPool,
  demoTrades,
} from '@/lib/demo-data'

export async function getArbitrageTerminalData(): Promise<ArbitrageTerminalData> {
  // TODO: replace with real per-user DB reads (ArbitrageBalance, ArbitragePhase, etc.)
  return {
    balance: demoBalance,
    phase: demoPhase,
    buyExchange: 'BITCIRAZ',
    sellExchange: 'CXI',
    totalPool: demoTotalPool,
    buyOffers: demoBuyOffers,
    sellOffers: demoSellOffers,
    trades: demoTrades,
    accruals: demoAccruals,
    operations: demoOperations,
  }
}
