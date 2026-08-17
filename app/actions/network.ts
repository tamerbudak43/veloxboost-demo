'use server'

import { getMyProfile } from '@/app/actions/member'
import { loadCareers, loadCommissionLevels, unlockedDepthFor } from '@/lib/network/config'
import { db } from '@/lib/db'
import { investmentReceipt, member, networkClosure } from '@/lib/db/schema'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
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
  const [rows, investmentRows] = await Promise.all([
    db.select().from(member).where(inArray(member.userId, userIds)),
    db
      .select({ userId: investmentReceipt.userId, total: sql<string>`coalesce(sum(${investmentReceipt.amount}), 0)` })
      .from(investmentReceipt)
      .where(and(inArray(investmentReceipt.userId, userIds), eq(investmentReceipt.status, 'confirmed')))
      .groupBy(investmentReceipt.userId),
  ])
  const byUserId = new Map(rows.map((row) => [row.userId, row]))
  const investmentByUserId = new Map(investmentRows.map((row) => [row.userId, safeNumber(row.total)]))

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
    // Only confirmed demo receipts are included. Pending instructions are not
    // treated as investment or payment records.
    personalInvestment: investmentByUserId.get(row.userId) ?? 0,
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

/**
 * Direct referral dashboard data. This is deliberately separate from the
 * multi-level network commission engine: only users whose sponsorId points
 * directly at the signed-in member are included. Amounts are UI simulations
 * based on recorded personal volume; no balance, payout, or ledger entry is
 * created here.
 */
export async function getDirectReferralDashboardData() {
  const profile = await getMyProfile()
  if (!profile) throw new Error('Üyelik profili bulunamadı.')

  const directs = await db
    .select({
      userId: member.userId,
      name: member.name,
      email: member.email,
      veloxId: member.veloxId,
      status: member.status,
      career: member.career,
      personalVolume: member.personalVolume,
      createdAt: member.createdAt,
    })
    .from(member)
    .where(eq(member.sponsorId, profile.userId))
    .orderBy(desc(member.createdAt))

  const partners = directs.map((item) => {
    const turnover = safeNumber(item.personalVolume)
    return {
      ...item,
      createdAt: item.createdAt.toISOString(),
      turnover,
      commission: turnover * 0.06,
    }
  })
  const directTurnover = partners.reduce((total, item) => total + item.turnover, 0)

  return {
    referralCode: profile.referralCode,
    directCount: partners.length,
    directTurnover,
    commissionRate: 6,
    simulatedCommission: directTurnover * 0.06,
    partners,
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
