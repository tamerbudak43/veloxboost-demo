import { clampProgress, safeNumber } from '@/lib/format'
import type { CashbackQualification, CashbackTierDef, RequirementProgress } from '@/lib/network/types'

function progress(key: string, label: string, current: number, required: number, format: 'count' | 'usdt'): RequirementProgress {
  const met = required <= 0 || current >= required
  return {
    key,
    label,
    current: safeNumber(current),
    required: safeNumber(required),
    met,
    progress: required <= 0 ? 100 : clampProgress((current / required) * 100),
    format,
  }
}

/**
 * Cashback is not a career promotion. This pure evaluator deliberately uses
 * only the configured cashback criteria: team volume and active directs.
 */
export function evaluateCashback(
  teamVolume: number,
  activeDirectPartners: number,
  tiers: CashbackTierDef[],
): CashbackQualification {
  const ordered = [...tiers].filter((tier) => tier.enabled).sort((a, b) => a.displayOrder - b.displayOrder)
  const eligibleTiers = ordered.filter((tier) =>
    teamVolume >= tier.requiredTeamVolume && activeDirectPartners >= tier.requiredDirectPartners,
  )
  const currentTier = eligibleTiers.at(-1) ?? null
  const nextTier = ordered.find((tier) => !currentTier || tier.displayOrder > currentTier.displayOrder) ?? null
  const target = nextTier ?? currentTier
  const requirements = target
    ? [
        progress('cashbackTeamVolume', 'Ağ hacmi', teamVolume, target.requiredTeamVolume, 'usdt'),
        progress('cashbackDirects', 'Aktif doğrudan ortak', activeDirectPartners, target.requiredDirectPartners, 'count'),
      ]
    : []

  return {
    currentTier,
    nextTier: currentTier ? nextTier : ordered[0] ?? null,
    eligible: Boolean(currentTier),
    requirements,
  }
}
