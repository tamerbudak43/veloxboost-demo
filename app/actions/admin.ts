'use server'

import { revalidatePath } from 'next/cache'
import { and, asc, count, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { career, careerRequirement, commissionLevel, member, withdrawal } from '@/lib/db/schema'
import { getSessionMember, requireAdmin } from '@/lib/admin-auth'
import { safeNumber } from '@/lib/format'

/** Lightweight check used by the admin login form after sign-in. */
export async function checkAdminAccess(): Promise<boolean> {
  const me = await getSessionMember()
  return me?.role === 'admin'
}

/** Creates only non-financial initial configuration for a fresh database.
 * Rates and thresholds are deliberately zero until an administrator sets them. */
async function ensureInitialAdminConfig() {
  const existing = await db.select({ total: count() }).from(career)
  if ((existing[0]?.total ?? 0) === 0) {
    const created = await db.insert(career).values([
      { code: 'STARTER', name: 'Starter', displayOrder: 1, unlockedDepth: 3 },
      { code: 'BRONZE', name: 'Bronze', displayOrder: 2, unlockedDepth: 6 },
      { code: 'SILVER', name: 'Silver', displayOrder: 3, unlockedDepth: 10 },
      { code: 'GOLD', name: 'Gold', displayOrder: 4, unlockedDepth: 14 },
      { code: 'PLATINUM', name: 'Platinum', displayOrder: 5, unlockedDepth: 20 },
      { code: 'DIAMOND', name: 'Diamond', displayOrder: 6, unlockedDepth: 33 },
    ]).returning({ id: career.id })
    await db.insert(careerRequirement).values(created.map((row) => ({ careerId: row.id })))
  }
  const commissionCount = await db.select({ total: count() }).from(commissionLevel)
  if ((commissionCount[0]?.total ?? 0) === 0) {
    await db.insert(commissionLevel).values(
      Array.from({ length: 33 }, (_, index) => ({
        level: index + 1,
        percentage: '0',
        requiredCareerCode: 'STARTER',
        enabled: false,
      })),
    )
  }
}

/** Real member rows for the admin user screen. KYC remains pending until the
 * dedicated KYC domain is added; it is never fabricated as verified. */
export async function loadAdminUsers() {
  await requireAdmin()
  const rows = await db.select().from(member).orderBy(asc(member.createdAt))
  return rows.map((row) => ({
    id: row.userId,
    name: row.name,
    veloxId: row.veloxId,
    email: row.email,
    career: row.career,
    balance: safeNumber(row.balance),
    status: row.status === 'inactive' ? 'suspended' as const : 'active' as const,
    kyc: 'pending' as const,
    joinedAt: row.createdAt.toISOString(),
  }))
}

/** DB-backed overview. Financial totals are zero until the immutable ledger
 * phase writes authoritative deposit and withdrawal entries. */
export async function loadAdminOverview() {
  await requireAdmin()
  const [memberStats] = await db
    .select({
      totalUsers: count(),
      activeUsers: sql<number>`count(*) filter (where ${member.status} in ('active', 'qualified'))`,
    })
    .from(member)
  const pending = await db.select().from(withdrawal).where(eq(withdrawal.status, 'pending')).limit(4)
  return {
    kpi: {
      totalUsers: memberStats?.totalUsers ?? 0,
      activeUsers: Number(memberStats?.activeUsers ?? 0),
      totalDeposits: 0,
      totalWithdrawals: 0,
      poolBalance: 0,
      pendingWithdrawals: pending.length,
      activeContracts: 0,
      dailyVolume: 0,
    },
    withdrawals: pending.map((row) => ({
      id: String(row.id),
      userName: row.userName,
      veloxId: row.veloxId,
      amount: safeNumber(row.amount),
      fee: safeNumber(row.fee),
      net: safeNumber(row.net),
      address: row.address,
      network: row.network,
      status: row.status as 'pending',
      requestedAt: row.createdAt.toISOString(),
    })),
  }
}

/* ------------------------------- Careers -------------------------------- */

export async function loadCareerAdmin() {
  await requireAdmin()
  await ensureInitialAdminConfig()
  const careers = await db.select().from(career).orderBy(asc(career.displayOrder))
  const reqs = await db.select().from(careerRequirement)
  return careers.map((c) => ({
    ...c,
    dailyWithdrawalLimit: safeNumber(c.dailyWithdrawalLimit),
    careerReward: safeNumber(c.careerReward),
    requirement: reqs.find((r) => r.careerId === c.id) ?? null,
  }))
}

export async function updateCareer(input: {
  id: number
  unlockedDepth: number
  dailyWithdrawalLimit: number
  careerReward: number
  enabled: boolean
}) {
  await requireAdmin()
  await db
    .update(career)
    .set({
      unlockedDepth: Math.max(0, Math.min(33, Math.floor(safeNumber(input.unlockedDepth)))),
      dailyWithdrawalLimit: String(Math.max(0, safeNumber(input.dailyWithdrawalLimit))),
      careerReward: String(Math.max(0, safeNumber(input.careerReward))),
      enabled: Boolean(input.enabled),
    })
    .where(eq(career.id, input.id))
  revalidatePath('/admin/careers')
  revalidatePath('/career')
}

export async function updateCareerRequirement(input: {
  careerId: number
  requiredPersonalPartners: number
  requiredActivePartners: number
  requiredQualifiedPartners: number
  requiredPersonalInvestment: number
  requiredPersonalVolume: number
  requiredDirectVolume: number
  requiredTeamVolume: number
  requiredStrongLegVolume: number
  requiredOtherLegVolume: number
}) {
  await requireAdmin()
  const n = (v: number) => String(Math.max(0, safeNumber(v)))
  const i = (v: number) => Math.max(0, Math.floor(safeNumber(v)))
  const existing = await db
    .select()
    .from(careerRequirement)
    .where(eq(careerRequirement.careerId, input.careerId))
    .limit(1)

  const values = {
    careerId: input.careerId,
    requiredPersonalPartners: i(input.requiredPersonalPartners),
    requiredActivePartners: i(input.requiredActivePartners),
    requiredQualifiedPartners: i(input.requiredQualifiedPartners),
    requiredPersonalInvestment: n(input.requiredPersonalInvestment),
    requiredPersonalVolume: n(input.requiredPersonalVolume),
    requiredDirectVolume: n(input.requiredDirectVolume),
    requiredTeamVolume: n(input.requiredTeamVolume),
    requiredStrongLegVolume: n(input.requiredStrongLegVolume),
    requiredOtherLegVolume: n(input.requiredOtherLegVolume),
  }

  if (existing[0]) {
    await db.update(careerRequirement).set(values).where(eq(careerRequirement.id, existing[0].id))
  } else {
    await db.insert(careerRequirement).values(values)
  }
  revalidatePath('/admin/careers')
  revalidatePath('/career')
}

/* ---------------------------- Commissions ------------------------------- */

export async function loadCommissionAdmin() {
  await requireAdmin()
  await ensureInitialAdminConfig()
  const rows = await db.select().from(commissionLevel).orderBy(asc(commissionLevel.level))
  return rows.map((r) => ({ ...r, percentage: safeNumber(r.percentage) }))
}

export async function updateCommissionLevel(input: {
  id: number
  percentage: number
  requiredCareerCode: string
  enabled: boolean
}) {
  await requireAdmin()
  await db
    .update(commissionLevel)
    .set({
      percentage: String(Math.max(0, Math.min(100, safeNumber(input.percentage)))),
      requiredCareerCode: input.requiredCareerCode,
      enabled: Boolean(input.enabled),
    })
    .where(eq(commissionLevel.id, input.id))
  revalidatePath('/admin/commissions')
  revalidatePath('/partners')
}

/* ------------------------------ Network --------------------------------- */

/** Admin member search by name / email / VELOX ID. */
export async function searchMembers(query: string) {
  await requireAdmin()
  const q = query.trim()
  const base = db.select().from(member).orderBy(asc(member.createdAt)).limit(50)
  if (!q) return (await base).map(mapMember)
  const like = `%${q}%`
  const rows = await db
    .select()
    .from(member)
    .where(or(ilike(member.name, like), ilike(member.email, like), ilike(member.veloxId, like)))
    .limit(50)
  return rows.map(mapMember)
}

/** Promote / demote a member's role (admin ↔ member). */
export async function setMemberRole(userId: string, role: 'admin' | 'member') {
  const me = await requireAdmin()
  // Never let an admin strip their own admin role (avoid lockout).
  if (userId === me.userId && role !== 'admin') {
    throw new Error('Kendi yönetici yetkinizi kaldıramazsınız.')
  }
  await db.update(member).set({ role }).where(eq(member.userId, userId))
  revalidatePath('/admin/network')
  revalidatePath('/admin/users')
}

function mapMember(m: typeof member.$inferSelect) {
  return {
    userId: m.userId,
    name: m.name,
    email: m.email,
    veloxId: m.veloxId,
    referralCode: m.referralCode,
    sponsorId: m.sponsorId,
    role: m.role,
    status: m.status,
    career: m.career,
    personalVolume: safeNumber(m.personalVolume),
    teamVolume: safeNumber(m.teamVolume),
    balance: safeNumber(m.balance),
    directCount: m.directCount,
    createdAt: m.createdAt,
  }
}
