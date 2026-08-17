/**
 * VELOX career qualification engine. Evaluates a member's authoritative
 * metrics against the DB-configured requirements of the next career.
 */
import { clampProgress, safeNumber } from '@/lib/format'
import type { CareerDef, CareerProgress, RequirementProgress } from '@/lib/network/types'

export interface CareerMetrics {
  personalPartners: number
  activePartners: number
  qualifiedPartners: number
  personalInvestment: number
  personalVolume: number
  directVolume: number
  teamVolume: number
  strongLegVolume: number
  otherLegVolume: number
}

function req(
  key: string,
  label: string,
  current: number,
  required: number,
  format: 'count' | 'usdt',
): RequirementProgress {
  const met = required <= 0 ? true : current >= required
  const progress = required <= 0 ? 100 : clampProgress((current / required) * 100)
  return { key, label, current: safeNumber(current), required: safeNumber(required), progress, met, format }
}

/**
 * Returns the current career, the next career and per-requirement progress.
 * `currentCareerCode` is the member's stored career; the engine measures
 * progress toward the next-ranked career in the ladder.
 */
export function evaluateCareer(
  metrics: CareerMetrics,
  careers: CareerDef[],
  currentCareerCode: string,
): CareerProgress {
  const ordered = [...careers].sort((a, b) => a.displayOrder - b.displayOrder)
  if (ordered.length === 0) {
    return {
      currentCareer: {
        id: 0,
        code: currentCareerCode || 'STARTER',
        name: currentCareerCode || 'STARTER',
        displayOrder: 0,
        unlockedDepth: 0,
        dailyWithdrawalLimit: 0,
        careerReward: 0,
        requirements: {
          requiredPersonalPartners: 0,
          requiredActivePartners: 0,
          requiredQualifiedPartners: 0,
          requiredPersonalInvestment: 0,
          requiredPersonalVolume: 0,
          requiredDirectVolume: 0,
          requiredTeamVolume: 0,
          requiredStrongLegVolume: 0,
          requiredOtherLegVolume: 0,
        },
      },
      nextCareer: null,
      progress: 0,
      requirements: [],
    }
  }
  const currentIdx = Math.max(
    0,
    ordered.findIndex((c) => c.code === currentCareerCode),
  )
  const currentCareer = ordered[currentIdx] ?? ordered[0]
  const nextCareer = ordered[currentIdx + 1] ?? null

  if (!nextCareer) {
    return { currentCareer, nextCareer: null, progress: 100, requirements: [] }
  }

  const r = nextCareer.requirements
  const requirements: RequirementProgress[] = [
    req('personalPartners', 'Kişisel Partner', metrics.personalPartners, r.requiredPersonalPartners, 'count'),
    req('activePartners', 'Aktif Partner', metrics.activePartners, r.requiredActivePartners, 'count'),
    req('qualifiedPartners', 'Nitelikli Partner', metrics.qualifiedPartners, r.requiredQualifiedPartners, 'count'),
    req('personalInvestment', 'Kişisel Yatırım', metrics.personalInvestment, r.requiredPersonalInvestment, 'usdt'),
    req('personalVolume', 'Kişisel Hacim', metrics.personalVolume, r.requiredPersonalVolume, 'usdt'),
    req('directVolume', 'Direkt Hacim', metrics.directVolume, r.requiredDirectVolume, 'usdt'),
    req('teamVolume', 'Takım Hacmi', metrics.teamVolume, r.requiredTeamVolume, 'usdt'),
    req('strongLeg', 'Güçlü Bacak', metrics.strongLegVolume, r.requiredStrongLegVolume, 'usdt'),
    req('otherLegs', 'Diğer Bacaklar', metrics.otherLegVolume, r.requiredOtherLegVolume, 'usdt'),
  ]

  const active = requirements.filter((x) => x.required > 0)
  const progress =
    active.length === 0
      ? 100
      : clampProgress(active.reduce((acc, x) => acc + x.progress, 0) / active.length)

  return { currentCareer, nextCareer, progress, requirements }
}
