'use server'

import { revalidatePath } from 'next/cache'
import { and, asc, count, desc, eq, ilike, like, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { career, careerRequirement, commissionLevel, demoLedgerEntry, investmentReceipt, member, networkClosure, withdrawal } from '@/lib/db/schema'
import { getSessionMember, requireAdmin } from '@/lib/admin-auth'
import { safeNumber } from '@/lib/format'
import { demoCommissionPlan } from '@/lib/network/demo-commission-plan'
import { buildDemoGrowthSimulation } from '@/lib/network/demo-growth-simulation'

/** Lightweight check used by the admin login form after sign-in. */
export async function checkAdminAccess(): Promise<boolean> {
  const me = await getSessionMember()
  return me?.role === 'admin'
}

/** Creates the default demo configuration for a fresh database. */
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
    await db.insert(commissionLevel).values(demoCommissionPlan.map((item) => ({
      level: item.level,
      percentage: String(item.percentage),
      requiredCareerCode: item.requiredCareerCode,
      enabled: item.enabled,
    })))
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

/* ------------------------- Phase-1 demo simulator ----------------------- */

const DEMO_PREFIX = 'demo-sim-'
const DEMO_RUN_KEY = 'phase-1-growth-v1'

/**
 * Creates a reproducible phase-1 dataset for the signed-in administrator.
 * No auth account, wallet record, payment instruction or blockchain request
 * is created for any synthetic member. Every generated row is marked DEMO.
 */
export async function seedPhaseOneDemoSimulation() {
  const admin = await requireAdmin()
  const { members: graph, simulation } = buildDemoGrowthSimulation({
    userId: admin.userId,
    name: admin.name,
    veloxId: admin.veloxId,
    career: admin.career,
  })
  const demoMembers = graph.filter((item) => item.id.startsWith(DEMO_PREFIX))

  await db.transaction(async (tx) => {
    await tx.delete(demoLedgerEntry).where(eq(demoLedgerEntry.runKey, DEMO_RUN_KEY))
    await tx.delete(withdrawal).where(like(withdrawal.userId, `${DEMO_PREFIX}%`))
    await tx.delete(investmentReceipt).where(like(investmentReceipt.userId, `${DEMO_PREFIX}%`))
    await tx.delete(networkClosure).where(or(like(networkClosure.ancestorUserId, `${DEMO_PREFIX}%`), like(networkClosure.descendantUserId, `${DEMO_PREFIX}%`)))
    await tx.delete(member).where(like(member.userId, `${DEMO_PREFIX}%`))

    if (demoMembers.length === 0) return
    await tx.insert(member).values(demoMembers.map((item, index) => ({
      userId: item.id,
      name: item.name,
      email: `demo+${item.id}@velox.invalid`,
      veloxId: item.veloxId,
      referralCode: `DEMO${String(index + 1).padStart(4, '0')}`,
      sponsorId: item.sponsorId,
      role: 'member',
      status: item.status,
      career: item.career,
      personalVolume: String(item.personalInvestment),
      teamVolume: '0',
      balance: '0',
      directCount: graph.filter((child) => child.sponsorId === item.id).length,
      createdAt: new Date(item.joinedAt),
    })))

    const byId = new Map(graph.map((item) => [item.id, item]))
    const closureRows: { ancestorUserId: string; descendantUserId: string; depth: number }[] = []
    for (const item of demoMembers) {
      let parentId = item.sponsorId
      let depth = 1
      while (parentId && depth <= 33) {
        closureRows.push({ ancestorUserId: parentId, descendantUserId: item.id, depth })
        parentId = byId.get(parentId)?.sponsorId ?? null
        depth++
      }
    }
    if (closureRows.length) await tx.insert(networkClosure).values(closureRows)

    const now = new Date()
    await tx.insert(investmentReceipt).values(demoMembers.map((item) => ({
      userId: item.id,
      receiptNumber: `DEMO-${item.veloxId}`,
      amount: String(item.personalInvestment),
      asset: 'USDT',
      network: 'DEMO',
      receivingAddress: 'DEMO-NO-WALLET',
      transactionHash: `DEMO-${item.id.toUpperCase()}`,
      status: 'confirmed',
      issuedAt: new Date(item.joinedAt),
      confirmedAt: new Date(item.joinedAt),
    })))

    const ledgerRows = demoMembers.flatMap((item) => {
      const accrual = Number((item.personalInvestment * 0.019).toFixed(2))
      const rows = [
        { runKey: DEMO_RUN_KEY, userId: item.id, userName: item.name, veloxId: item.veloxId, entryType: 'demo_investment', amount: String(item.personalInvestment), status: 'confirmed_demo', reference: `DEMO-${item.veloxId}-INV`, occurredAt: new Date(item.joinedAt) },
        { runKey: DEMO_RUN_KEY, userId: item.id, userName: item.name, veloxId: item.veloxId, entryType: 'demo_accrual', amount: String(accrual), status: 'accrued_demo', reference: `DEMO-${item.veloxId}-ACC`, occurredAt: now },
      ]
      if (accrual >= 25) rows.push({ runKey: DEMO_RUN_KEY, userId: item.id, userName: item.name, veloxId: item.veloxId, entryType: 'demo_auto_withdrawal', amount: String(-accrual), status: 'auto_withdrawn_demo', reference: `DEMO-${item.veloxId}-WDL`, occurredAt: now })
      return rows
    })
    await tx.insert(demoLedgerEntry).values(ledgerRows)
  })

  revalidatePath('/partners')
  revalidatePath('/admin')
  revalidatePath('/admin/network')
  revalidatePath('/admin/demo-simulation')
  return { created: demoMembers.length, day: simulation.currentDay }
}

export async function loadPhaseOneDemoSimulation() {
  await requireAdmin()
  const [members, ledger] = await Promise.all([
    db.select().from(member).where(like(member.userId, `${DEMO_PREFIX}%`)).orderBy(asc(member.createdAt)),
    db.select().from(demoLedgerEntry).where(eq(demoLedgerEntry.runKey, DEMO_RUN_KEY)).orderBy(desc(demoLedgerEntry.occurredAt)).limit(200),
  ])
  return {
    members: members.map((item) => ({ ...mapMember(item), personalInvestment: safeNumber(item.personalVolume), demo: true })),
    ledger: ledger.map((item) => ({ ...item, amount: safeNumber(item.amount), occurredAt: item.occurredAt.toISOString() })),
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
