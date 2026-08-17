import { safeNumber } from '@/lib/format'
import type { DemoFinanceSummary } from '@/lib/network/types'

/**
 * Transparent scenario accounting for the training dataset. It intentionally
 * produces no balance, withdrawal, receipt, or payment instruction.
 */
export function buildDemoFinanceSummary(input: {
  teamVolume: number
  distributionRate: number
  networkCommissionAllocation: number
  cashbackAllocation: number
}): DemoFinanceSummary {
  const teamVolume = safeNumber(input.teamVolume)
  const grossSystemIncome = teamVolume * 0.026
  const memberYieldAllocation = teamVolume * (safeNumber(input.distributionRate) / 100)
  const networkCommissionAllocation = safeNumber(input.networkCommissionAllocation)
  const cashbackAllocation = safeNumber(input.cashbackAllocation)
  const totalPlannedDistribution = memberYieldAllocation + networkCommissionAllocation + cashbackAllocation
  const simulatedReserve = grossSystemIncome - totalPlannedDistribution

  return {
    grossSystemIncome,
    memberYieldAllocation,
    networkCommissionAllocation,
    cashbackAllocation,
    totalPlannedDistribution,
    simulatedReserve,
    // The queue is a display-only scenario; the minimum rule mirrors the
    // previously agreed 25 USDT demo threshold.
    simulatedPaymentQueue: totalPlannedDistribution >= 25 ? totalPlannedDistribution : 0,
  }
}
