import type { CommissionLevelDef } from '@/lib/network/config'

/** Display-only daily scenario rate used by the VELOX demo network dashboard. */
export const DEMO_DAILY_ARBITRAGE_RATE = 1.9

/**
 * Demo distribution plan. It is intentionally centralised so the network
 * overview, depth rows and future admin settings do not drift apart.
 */
export function demoCommissionRate(level: number) {
  if (level === 1) return 7
  if (level === 2) return 5
  if (level === 3) return 3
  if (level <= 9) return 2
  return 1
}

export const demoCommissionPlan: CommissionLevelDef[] = Array.from({ length: 33 }, (_, index) => {
  const level = index + 1
  return {
    level,
    percentage: demoCommissionRate(level),
    requiredCareerCode: level <= 3 ? 'STARTER' : level <= 6 ? 'BRONZE' : level <= 10 ? 'SILVER' : level <= 14 ? 'GOLD' : level <= 20 ? 'PLATINUM' : 'DIAMOND',
    enabled: true,
  }
})
