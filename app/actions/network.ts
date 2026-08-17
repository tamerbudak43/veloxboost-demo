'use server'

import { getMyProfile } from '@/app/actions/member'
import { loadCareers, loadCommissionLevels, unlockedDepthFor } from '@/lib/network/config'
import { db } from '@/lib/db'
import { member, networkClosure } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { safeNumber } from '@/lib/format'
import {
  buildDepthRows,
  buildMemberList,
  buildSponsorTree,
  networkSummary,
} from '@/lib/services/network.service'
import { legSummaries } from '@/lib/services/volume.service'
import { evaluateCareer, type CareerMetrics } from '@/lib/services/career.service'
import { totalEarnings } from '@/lib/services/commission.service'
import { ensureCareerRewardAccrual } from '@/lib/services/career-reward.service'

/**
 * Assembles the network explorer from the signed-in member and the persisted
 * closure table. There is intentionally no demo fallback: an empty network is
 * a valid state for a new member.
 */
export async function getNetworkData() {
  const profile = await getMyProfile()
  if (!profile) throw new Error('Üyelik profili bulunamadı.')

  const rootId = profile.userId
  const closureRows = await db
    .select({ descendantUserId: networkClosure.descendantUserId, depth: networkClosure.depth })
    .from(networkClosure)
    .where(eq(networkClosure.ancestorUserId, rootId))

  const depthByUserId = new Map(closureRows.map((row) => [row.descendantUserId, row.depth]))
  const userIds = [rootId, ...closureRows.map((row) => row.descendantUserId)]
  const rows = await db.select().from(member).where(inArray(member.userId, userIds))
  const byUserId = new Map(rows.map((row) => [row.userId, row]))

  // Resolve each member's direct top-level branch under the signed-in user.
  const legRootFor = (userId: string) => {
    let current = byUserId.get(userId)
    const visited = new Set<string>()
    while (current?.sponsorId && current.sponsorId !== rootId && !visited.has(current.userId)) {
      visited.add(current.userId)
      current = byUserId.get(current.sponsorId)
    }
    return current?.userId ?? userId
  }

  const members = rows.map((row) => ({
    id: row.userId,
    name: row.name,
    veloxId: row.veloxId,
    sponsorId: row.sponsorId,
    depth: row.userId === rootId ? 0 : depthByUserId.get(row.userId) ?? 0,
    legRootId: row.userId === rootId ? rootId : legRootFor(row.userId),
    status: row.status === 'qualified' ? 'qualified' as const : row.status === 'inactive' ? 'inactive' as const : 'active' as const,
    career: row.career,
    // Investment balances are not inferred from member.balance. They will be
    // populated by the ledger/contract phase.
    personalInvestment: 0,
    personalVolume: safeNumber(row.personalVolume),
    joinedAt: row.createdAt.toISOString(),
  }))
  const currentCareer = profile.career

  const [careers, commissionLevels] = await Promise.all([loadCareers(), loadCommissionLevels()])
  const unlockedDepth = unlockedDepthFor(careers, currentCareer)

  const summary = networkSummary(members, rootId, currentCareer)
  const tree = buildSponsorTree(members, rootId)
  const legs = legSummaries(members, rootId)
  const depthRows = buildDepthRows(members, rootId, commissionLevels, unlockedDepth)
  const memberList = buildMemberList(members, rootId)
  // Commission history must be read from immutable ledger/earning records.
  // Until that phase is implemented, never fabricate an earning from volume.
  const earnings = []

  const metrics: CareerMetrics = {
    personalPartners: summary.directPartners,
    activePartners: summary.activePartners,
    qualifiedPartners: summary.qualifiedPartners,
    personalInvestment: 0,
    personalVolume: summary.personalVolume,
    directVolume: summary.directVolume,
    teamVolume: summary.teamVolume,
    strongLegVolume: summary.strongLegVolume,
    otherLegVolume: summary.otherLegVolume,
  }
  const careerProgress = evaluateCareer(metrics, careers, currentCareer)

  return {
    referralCode: profile.referralCode,
    summary,
    tree,
    legs,
    depthRows,
    memberList,
    earnings,
    totalEarnings: totalEarnings(earnings),
    careerProgress,
    unlockedDepth,
  }
}

/** Career progression payload for the /career page. */
export async function getCareerData() {
  const data = await getNetworkData()
  const profile = await getMyProfile()
  const reward = profile ? await ensureCareerRewardAccrual(profile.userId, profile.career) : null
  const careers = await loadCareers()
  return {
    summary: data.summary,
    careerProgress: data.careerProgress,
    careers,
    unlockedDepth: data.unlockedDepth,
    reward,
  }
}
