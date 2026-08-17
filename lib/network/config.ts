import 'server-only'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { career, careerRequirement, commissionLevel } from '@/lib/db/schema'
import { safeNumber } from '@/lib/format'
import type { CareerDef } from './types'
import { demoCommissionPlan } from './demo-commission-plan'

/** Loads the full career ladder with requirements, ordered by rank. */
export async function loadCareers(): Promise<CareerDef[]> {
  const careers = await db.select().from(career).orderBy(asc(career.displayOrder))
  const reqs = await db.select().from(careerRequirement)
  const reqByCareer = new Map(reqs.map((r) => [r.careerId, r]))

  return careers.map((c) => {
    const r = reqByCareer.get(c.id)
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      displayOrder: c.displayOrder,
      unlockedDepth: c.unlockedDepth,
      dailyWithdrawalLimit: safeNumber(c.dailyWithdrawalLimit),
      careerReward: safeNumber(c.careerReward),
      requirements: {
        requiredPersonalPartners: r?.requiredPersonalPartners ?? 0,
        requiredActivePartners: r?.requiredActivePartners ?? 0,
        requiredQualifiedPartners: r?.requiredQualifiedPartners ?? 0,
        requiredPersonalInvestment: safeNumber(r?.requiredPersonalInvestment),
        requiredPersonalVolume: safeNumber(r?.requiredPersonalVolume),
        requiredDirectVolume: safeNumber(r?.requiredDirectVolume),
        requiredTeamVolume: safeNumber(r?.requiredTeamVolume),
        requiredStrongLegVolume: safeNumber(r?.requiredStrongLegVolume),
        requiredOtherLegVolume: safeNumber(r?.requiredOtherLegVolume),
      },
    }
  })
}

export interface CommissionLevelDef {
  level: number
  percentage: number
  requiredCareerCode: string
  enabled: boolean
}

/** Loads all 33 commission levels ordered by level. */
export async function loadCommissionLevels(): Promise<CommissionLevelDef[]> {
  const rows = await db.select().from(commissionLevel).orderBy(asc(commissionLevel.level))
  // A fresh demo database starts with placeholder zero rows. Until the admin
  // explicitly configures a different plan, use the agreed demo distribution.
  const hasConfiguredPlan = rows.some((r) => r.enabled || safeNumber(r.percentage) > 0)
  if (!hasConfiguredPlan) return demoCommissionPlan
  return rows.map((r) => ({
    level: r.level,
    percentage: safeNumber(r.percentage),
    requiredCareerCode: r.requiredCareerCode,
    enabled: r.enabled,
  }))
}

/** Returns the unlocked commission depth for a career code. */
export function unlockedDepthFor(careers: CareerDef[], careerCode: string): number {
  return careers.find((c) => c.code === careerCode)?.unlockedDepth ?? 3
}

export { career as careerTable, careerRequirement as careerRequirementTable, commissionLevel as commissionLevelTable, eq }
