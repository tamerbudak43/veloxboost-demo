'use server'

import { revalidatePath } from 'next/cache'
import { and, asc, count, desc, eq, gte, ilike, like, ne, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { account, cashbackTier, career, careerRequirement, careerRewardAccrual, commissionLevel, demoLedgerEntry, investmentReceipt, member, networkClosure, session, user as authUser, verification, withdrawal } from '@/lib/db/schema'
import { getSessionMember, requireAdmin } from '@/lib/admin-auth'
import { safeNumber } from '@/lib/format'
import { demoCommissionPlan } from '@/lib/network/demo-commission-plan'
import { buildDemoGrowthSimulation } from '@/lib/network/demo-growth-simulation'
import { DEMO_DAILY_DISTRIBUTION_AVERAGE } from '@/lib/network/demo-market-scenario'

type CareerPlan = {
  code: string
  name: string
  displayOrder: number
  unlockedDepth: number
  dailyWithdrawalLimit: number
  careerReward: number
  requiredPersonalPartners: number
  requiredActivePartners: number
  requiredQualifiedPartners: number
  requiredPersonalInvestment: number
  requiredPersonalVolume: number
  requiredDirectVolume: number
  requiredTeamVolume: number
  requiredStrongLegVolume: number
  requiredOtherLegVolume: number
}

type CashbackPlan = {
  code: string
  name: string
  displayOrder: number
  fromDepth: number
  toDepth: number
  requiredTeamVolume: number
  requiredDirectPartners: number
  cashbackAmount: number
  dailyWithdrawalLimit: number
}

const ONETRADE_CASHBACK_PLAN: CashbackPlan[] = [
  { code: 'BRONZE', name: 'Bronze', displayOrder: 1, fromDepth: 1, toDepth: 3, requiredTeamVolume: 5000, requiredDirectPartners: 2, cashbackAmount: 100, dailyWithdrawalLimit: 1000 },
  { code: 'SILVER', name: 'Silver', displayOrder: 2, fromDepth: 4, toDepth: 6, requiredTeamVolume: 15000, requiredDirectPartners: 3, cashbackAmount: 300, dailyWithdrawalLimit: 2000 },
  { code: 'GOLD', name: 'Gold', displayOrder: 3, fromDepth: 7, toDepth: 9, requiredTeamVolume: 50000, requiredDirectPartners: 4, cashbackAmount: 1000, dailyWithdrawalLimit: 3000 },
  { code: 'PLATINUM', name: 'Platinum', displayOrder: 4, fromDepth: 10, toDepth: 12, requiredTeamVolume: 150000, requiredDirectPartners: 5, cashbackAmount: 3000, dailyWithdrawalLimit: 4000 },
  { code: 'DIAMOND', name: 'Diamond', displayOrder: 5, fromDepth: 13, toDepth: 15, requiredTeamVolume: 450000, requiredDirectPartners: 6, cashbackAmount: 9000, dailyWithdrawalLimit: 5000 },
  { code: 'BLUE_DIAMOND', name: 'Blue Diamond', displayOrder: 6, fromDepth: 16, toDepth: 18, requiredTeamVolume: 1500000, requiredDirectPartners: 7, cashbackAmount: 30000, dailyWithdrawalLimit: 6000 },
  { code: 'RED_DIAMOND', name: 'Red Diamond', displayOrder: 7, fromDepth: 19, toDepth: 21, requiredTeamVolume: 4500000, requiredDirectPartners: 8, cashbackAmount: 90000, dailyWithdrawalLimit: 7000 },
  { code: 'BLACK_DIAMOND', name: 'Black Diamond', displayOrder: 8, fromDepth: 22, toDepth: 24, requiredTeamVolume: 15000000, requiredDirectPartners: 9, cashbackAmount: 300000, dailyWithdrawalLimit: 8000 },
  { code: 'AMBASSADOR', name: 'Ambassador', displayOrder: 9, fromDepth: 25, toDepth: 27, requiredTeamVolume: 45000000, requiredDirectPartners: 10, cashbackAmount: 900000, dailyWithdrawalLimit: 9000 },
  { code: 'CROWN_AMBASSADOR', name: 'Crown Ambassador', displayOrder: 10, fromDepth: 28, toDepth: 33, requiredTeamVolume: 150000000, requiredDirectPartners: 11, cashbackAmount: 2700000, dailyWithdrawalLimit: 10000 },
]

async function applyOneTradeCashbackPlanDefaults() {
  const existing = await db.select().from(cashbackTier)
  const byCode = new Map(existing.map((tier) => [tier.code, tier]))
  for (const plan of ONETRADE_CASHBACK_PLAN) {
    const values = {
      code: plan.code,
      name: plan.name,
      displayOrder: plan.displayOrder,
      fromDepth: plan.fromDepth,
      toDepth: plan.toDepth,
      requiredTeamVolume: String(plan.requiredTeamVolume),
      requiredDirectPartners: plan.requiredDirectPartners,
      cashbackAmount: String(plan.cashbackAmount),
      dailyWithdrawalLimit: String(plan.dailyWithdrawalLimit),
      enabled: true,
    }
    const current = byCode.get(plan.code)
    if (current) await db.update(cashbackTier).set(values).where(eq(cashbackTier.id, current.id))
    else await db.insert(cashbackTier).values(values)
  }
}

/** OneTrade reference ladder, used only as configurable demo defaults. */
const ONETRADE_CAREER_PLAN: CareerPlan[] = [
  { code: 'STARTER', name: 'Starter', displayOrder: 1, unlockedDepth: 3, dailyWithdrawalLimit: 500, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 0, requiredQualifiedPartners: 0, requiredPersonalInvestment: 0, requiredPersonalVolume: 0, requiredDirectVolume: 0, requiredTeamVolume: 0, requiredStrongLegVolume: 0, requiredOtherLegVolume: 0 },
  { code: 'BRONZE', name: 'Bronze', displayOrder: 2, unlockedDepth: 5, dailyWithdrawalLimit: 1000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 2, requiredQualifiedPartners: 0, requiredPersonalInvestment: 500, requiredPersonalVolume: 500, requiredDirectVolume: 1000, requiredTeamVolume: 0, requiredStrongLegVolume: 600, requiredOtherLegVolume: 400 },
  { code: 'SILVER', name: 'Silver', displayOrder: 3, unlockedDepth: 8, dailyWithdrawalLimit: 2000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 3, requiredQualifiedPartners: 0, requiredPersonalInvestment: 1000, requiredPersonalVolume: 1000, requiredDirectVolume: 3000, requiredTeamVolume: 0, requiredStrongLegVolume: 1800, requiredOtherLegVolume: 1200 },
  { code: 'GOLD', name: 'Gold', displayOrder: 4, unlockedDepth: 10, dailyWithdrawalLimit: 3000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 4, requiredQualifiedPartners: 0, requiredPersonalInvestment: 2500, requiredPersonalVolume: 2500, requiredDirectVolume: 7500, requiredTeamVolume: 0, requiredStrongLegVolume: 4500, requiredOtherLegVolume: 3000 },
  { code: 'PLATINUM', name: 'Platinum', displayOrder: 5, unlockedDepth: 15, dailyWithdrawalLimit: 4000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 5, requiredQualifiedPartners: 0, requiredPersonalInvestment: 5000, requiredPersonalVolume: 5000, requiredDirectVolume: 15000, requiredTeamVolume: 0, requiredStrongLegVolume: 9000, requiredOtherLegVolume: 6000 },
  { code: 'DIAMOND', name: 'Diamond', displayOrder: 6, unlockedDepth: 20, dailyWithdrawalLimit: 5000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 6, requiredQualifiedPartners: 0, requiredPersonalInvestment: 10000, requiredPersonalVolume: 10000, requiredDirectVolume: 30000, requiredTeamVolume: 0, requiredStrongLegVolume: 18000, requiredOtherLegVolume: 12000 },
  { code: 'BLUE_DIAMOND', name: 'Blue Diamond', displayOrder: 7, unlockedDepth: 25, dailyWithdrawalLimit: 6000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 7, requiredQualifiedPartners: 0, requiredPersonalInvestment: 20000, requiredPersonalVolume: 20000, requiredDirectVolume: 60000, requiredTeamVolume: 0, requiredStrongLegVolume: 36000, requiredOtherLegVolume: 24000 },
  { code: 'RED_DIAMOND', name: 'Red Diamond', displayOrder: 8, unlockedDepth: 28, dailyWithdrawalLimit: 7000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 8, requiredQualifiedPartners: 0, requiredPersonalInvestment: 30000, requiredPersonalVolume: 30000, requiredDirectVolume: 100000, requiredTeamVolume: 0, requiredStrongLegVolume: 60000, requiredOtherLegVolume: 40000 },
  { code: 'BLACK_DIAMOND', name: 'Black Diamond', displayOrder: 9, unlockedDepth: 30, dailyWithdrawalLimit: 8000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 9, requiredQualifiedPartners: 0, requiredPersonalInvestment: 50000, requiredPersonalVolume: 50000, requiredDirectVolume: 180000, requiredTeamVolume: 0, requiredStrongLegVolume: 108000, requiredOtherLegVolume: 72000 },
  { code: 'AMBASSADOR', name: 'Ambassador', displayOrder: 10, unlockedDepth: 33, dailyWithdrawalLimit: 9000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 10, requiredQualifiedPartners: 0, requiredPersonalInvestment: 75000, requiredPersonalVolume: 75000, requiredDirectVolume: 300000, requiredTeamVolume: 0, requiredStrongLegVolume: 180000, requiredOtherLegVolume: 120000 },
  { code: 'CROWN_AMBASSADOR', name: 'Crown Ambassador', displayOrder: 11, unlockedDepth: 33, dailyWithdrawalLimit: 10000, careerReward: 0, requiredPersonalPartners: 0, requiredActivePartners: 11, requiredQualifiedPartners: 0, requiredPersonalInvestment: 100000, requiredPersonalVolume: 100000, requiredDirectVolume: 500000, requiredTeamVolume: 0, requiredStrongLegVolume: 300000, requiredOtherLegVolume: 200000 },
]

async function applyOneTradeCareerPlanDefaults() {
  const existingCareers = await db.select().from(career)
  const requirements = await db.select().from(careerRequirement)
  const careersByCode = new Map(existingCareers.map((item) => [item.code, item]))
  const requirementsByCareer = new Map(requirements.map((item) => [item.careerId, item]))

  for (const plan of ONETRADE_CAREER_PLAN) {
    const values = {
      code: plan.code,
      name: plan.name,
      displayOrder: plan.displayOrder,
      unlockedDepth: plan.unlockedDepth,
      dailyWithdrawalLimit: String(plan.dailyWithdrawalLimit),
      careerReward: String(plan.careerReward),
      enabled: true,
    }
    const current = careersByCode.get(plan.code)
    const careerId = current
      ? current.id
      : (await db.insert(career).values(values).returning({ id: career.id }))[0]?.id

    if (!careerId) throw new Error(`${plan.name} kariyeri oluşturulamadı.`)
    if (current) await db.update(career).set(values).where(eq(career.id, careerId))

    const requirementValues = {
      careerId,
      requiredPersonalPartners: plan.requiredPersonalPartners,
      requiredActivePartners: plan.requiredActivePartners,
      requiredQualifiedPartners: plan.requiredQualifiedPartners,
      requiredPersonalInvestment: String(plan.requiredPersonalInvestment),
      requiredPersonalVolume: String(plan.requiredPersonalVolume),
      requiredDirectVolume: String(plan.requiredDirectVolume),
      requiredTeamVolume: String(plan.requiredTeamVolume),
      requiredStrongLegVolume: String(plan.requiredStrongLegVolume),
      requiredOtherLegVolume: String(plan.requiredOtherLegVolume),
    }
    if (requirementsByCareer.has(careerId)) {
      await db.update(careerRequirement).set(requirementValues).where(eq(careerRequirement.careerId, careerId))
    } else {
      await db.insert(careerRequirement).values(requirementValues)
    }
  }
}

/** Lightweight check used by the admin login form after sign-in. */
export async function checkAdminAccess(): Promise<boolean> {
  const me = await getSessionMember()
  return me?.role === 'admin'
}

/** Creates the default demo configuration for a fresh database. */
async function ensureInitialAdminConfig() {
  const existing = await db.select({ total: count() }).from(career)
  if ((existing[0]?.total ?? 0) === 0) {
    await applyOneTradeCareerPlanDefaults()
  } else {
    // Existing installations may already have the original ten-rank ladder.
    // Insert RED DIAMOND once and preserve every admin-configured threshold
    // on the surrounding careers.
    const rows = await db.select({ id: career.id }).from(career).where(eq(career.code, 'RED_DIAMOND')).limit(1)
    if (!rows[0]) {
      await db.update(career).set({ displayOrder: sql`${career.displayOrder} + 1` }).where(gte(career.displayOrder, 8))
      const [redDiamond] = await db.insert(career).values({
        code: 'RED_DIAMOND',
        name: 'Red Diamond',
        displayOrder: 8,
        unlockedDepth: 28,
        dailyWithdrawalLimit: '75000',
        careerReward: '0',
        enabled: true,
      }).returning({ id: career.id })
      if (!redDiamond) throw new Error('RED DIAMOND kariyeri oluşturulamadı.')
      await db.insert(careerRequirement).values({
        careerId: redDiamond.id,
        requiredPersonalPartners: 18,
        requiredActivePartners: 14,
        requiredQualifiedPartners: 10,
        requiredPersonalInvestment: '15000',
        requiredPersonalVolume: '15000',
        requiredDirectVolume: '120000',
        requiredTeamVolume: '800000',
        requiredStrongLegVolume: '480000',
        requiredOtherLegVolume: '320000',
      })
    }
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
const DEMO_DIRECT_REFERRAL_RATE = 0.06

/**
 * Irreversible phase-1 reset. It retains only the currently signed-in admin
 * identity and baseline career/commission configuration. The confirmation is
 * intentionally checked server-side; no client input can bypass it.
 */
export async function resetPhaseOneDemoBaseline(confirmation: string) {
  const admin = await requireAdmin()
  if (confirmation.trim().toUpperCase() !== 'SIFIRLA') {
    throw new Error('Sıfırlama için SIFIRLA onayı gerekli.')
  }

  await db.transaction(async (tx) => {
    await tx.delete(demoLedgerEntry)
    await tx.delete(withdrawal)
    await tx.delete(investmentReceipt)
    await tx.delete(careerRewardAccrual)
    await tx.delete(networkClosure)
    await tx.delete(member).where(ne(member.userId, admin.userId))
    await tx.delete(account).where(ne(account.userId, admin.userId))
    await tx.delete(session).where(ne(session.userId, admin.userId))
    await tx.delete(authUser).where(ne(authUser.id, admin.userId))
    await tx.delete(verification)
    await tx.update(member).set({
      sponsorId: null,
      status: 'active',
      career: 'STARTER',
      personalVolume: '0',
      teamVolume: '0',
      leftVolume: '0',
      rightVolume: '0',
      balance: '0',
      directCount: 0,
    }).where(eq(member.userId, admin.userId))
  })

  revalidatePath('/partners')
  revalidatePath('/admin')
  revalidatePath('/admin/users')
  revalidatePath('/admin/network')
  revalidatePath('/admin/demo-simulation')
  revalidatePath('/admin/reports')
  return { ok: true, retainedAdmin: admin.name }
}

/**
 * Creates a reproducible phase-1 dataset for the signed-in administrator.
 * No auth account, wallet record, payment instruction or blockchain request
 * is created for any synthetic member. Every generated row is marked DEMO.
 */
export async function seedPhaseOneDemoSimulation() {
  const admin = await requireAdmin()
  await ensureInitialAdminConfig()
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
    const [commissionRows, careerRows] = await Promise.all([
      tx.select().from(commissionLevel),
      tx.select().from(career),
    ])
    const commissionByDepth = new Map(commissionRows.filter((row) => row.enabled).map((row) => [row.level, row]))
    const careerOrder = new Map(careerRows.map((row) => [row.code, row.displayOrder]))
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

    const ledgerRows = demoMembers.map((item) => ({ runKey: DEMO_RUN_KEY, userId: item.id, userName: item.name, veloxId: item.veloxId, entryType: 'demo_investment', amount: String(item.personalInvestment), status: 'confirmed_demo', reference: `DEMO-${item.veloxId}-INV`, occurredAt: new Date(item.joinedAt) }))
    // One deterministic daily financial snapshot per simulated day. These are
    // report-only ledger rows and are never handed to wallet or payment code.
    const now = new Date()
    const activatedMemberIds = new Set<string>()
    const unpaidCredits = new Map<string, number>()
    const addUnpaidCredit = (userId: string, amount: number) => {
      unpaidCredits.set(userId, Number(((unpaidCredits.get(userId) ?? 0) + amount).toFixed(2)))
    }
    for (let day = 1; day <= simulation.currentDay; day++) {
      const occurredAt = new Date(now.getTime() - (simulation.currentDay - day) * 86_400_000)
      const active = demoMembers.filter((item) => new Date(item.joinedAt).getTime() <= occurredAt.getTime())
      const newlyActive = active.filter((item) => !activatedMemberIds.has(item.id))
      newlyActive.forEach((item) => activatedMemberIds.add(item.id))
      const activeCapital = active.reduce((total, item) => total + item.personalInvestment, 0)
      const gross = Number((activeCapital * 0.026).toFixed(2))
      ledgerRows.push({ runKey: DEMO_RUN_KEY, userId: admin.userId, userName: admin.name, veloxId: admin.veloxId, entryType: 'demo_arbitrage_income', amount: String(gross), status: 'scenario_income', reference: `DEMO-D${day}-ARB`, occurredAt })

      // Referral is a one-off direct-sponsor commission: 6% of the newly
      // joined member's initial investment. It is not a slice of daily yield.
      for (const item of newlyActive) {
        const sponsor = item.sponsorId ? byId.get(item.sponsorId) : null
        const referral = Number((item.personalInvestment * DEMO_DIRECT_REFERRAL_RATE).toFixed(2))
        if (referral <= 0 || !sponsor) continue
        ledgerRows.push({ runKey: DEMO_RUN_KEY, userId: sponsor.id, userName: sponsor.name, veloxId: sponsor.veloxId, entryType: 'demo_referral_commission', amount: String(referral), status: 'accrued_demo', reference: `DEMO-${item.veloxId}-D${day}-REF6`, occurredAt })
        addUnpaidCredit(sponsor.id, referral)
      }

      for (const item of active) {
        const accrual = Number((item.personalInvestment * (DEMO_DAILY_DISTRIBUTION_AVERAGE / 100)).toFixed(2))
        ledgerRows.push({ runKey: DEMO_RUN_KEY, userId: item.id, userName: item.name, veloxId: item.veloxId, entryType: 'demo_accrual', amount: String(accrual), status: 'accrued_demo', reference: `DEMO-${item.veloxId}-D${day}-ACC`, occurredAt })
        addUnpaidCredit(item.id, accrual)

        // Each eligible upline receives its separately configured network
        // rate from this member's daily investment yield. The current admin
        // commission plan and career gate are the sole source of truth.
        let ancestorId = item.sponsorId
        let depth = 1
        while (ancestorId && depth <= 33) {
          const recipient = byId.get(ancestorId)
          const level = commissionByDepth.get(depth)
          if (!recipient || !level) break
          const requiredCareerOrder = careerOrder.get(level.requiredCareerCode) ?? 0
          const recipientCareerOrder = careerOrder.get(recipient.career) ?? 0
          if (recipientCareerOrder >= requiredCareerOrder) {
            const networkCommission = Number((accrual * (safeNumber(level.percentage) / 100)).toFixed(2))
            if (networkCommission > 0) {
              ledgerRows.push({ runKey: DEMO_RUN_KEY, userId: recipient.id, userName: recipient.name, veloxId: recipient.veloxId, entryType: 'demo_network_commission', amount: String(networkCommission), status: 'accrued_demo', reference: `DEMO-${item.veloxId}-D${day}-L${depth}-NET`, occurredAt })
              addUnpaidCredit(recipient.id, networkCommission)
            }
          }
          ancestorId = recipient.sponsorId
          depth++
        }
      }
      for (const [recipientId, payout] of unpaidCredits) {
        const recipient = byId.get(recipientId)
        if (!recipient || payout < 25) continue
        ledgerRows.push({ runKey: DEMO_RUN_KEY, userId: recipient.id, userName: recipient.name, veloxId: recipient.veloxId, entryType: 'demo_auto_withdrawal', amount: String(-payout), status: 'auto_withdrawn_demo', reference: `DEMO-${recipient.veloxId}-D${day}-WDL`, occurredAt })
        unpaidCredits.set(recipientId, 0)
      }
    }
    await tx.insert(demoLedgerEntry).values(ledgerRows)
  })

  revalidatePath('/partners')
  revalidatePath('/admin')
  revalidatePath('/admin/network')
  revalidatePath('/admin/demo-simulation')
  revalidatePath('/admin/reports')
  return { created: demoMembers.length, day: simulation.currentDay }
}

/**
 * Appends the second-day intake without clearing the first 13 demo records.
 * The first 40 deterministic graph nodes are used, so current entries retain
 * their IDs, sponsors and ledger history while only the missing members arrive.
 */
export async function appendPhaseOneDemoMembersToForty() {
  const admin = await requireAdmin()
  await ensureInitialAdminConfig()
  const { members: graph, simulation } = buildDemoGrowthSimulation({
    userId: admin.userId,
    name: admin.name,
    veloxId: admin.veloxId,
    career: admin.career,
  })
  const targetMembers = graph.filter((item) => item.id.startsWith(DEMO_PREFIX)).slice(0, 40)

  const result = await db.transaction(async (tx) => {
    const existing = await tx.select().from(member).where(like(member.userId, `${DEMO_PREFIX}%`))
    const existingIds = new Set(existing.map((item) => item.userId))
    const additions = targetMembers.filter((item) => !existingIds.has(item.id))
    if (additions.length === 0) return { added: 0, total: existing.length }

    await tx.insert(member).values(additions.map((item, index) => ({
      userId: item.id,
      name: item.name,
      email: `demo+${item.id}@velox.invalid`,
      veloxId: item.veloxId,
      referralCode: `DEMO${String(existing.length + index + 1).padStart(4, '0')}`,
      sponsorId: item.sponsorId,
      role: 'member',
      status: item.status,
      career: item.career,
      personalVolume: String(item.personalInvestment),
      teamVolume: '0',
      balance: '0',
      directCount: 0,
      createdAt: new Date(item.joinedAt),
    })))

    const byId = new Map(graph.map((item) => [item.id, item]))
    const closureRows: { ancestorUserId: string; descendantUserId: string; depth: number }[] = []
    for (const item of additions) {
      let ancestorId = item.sponsorId
      let depth = 1
      while (ancestorId && depth <= 33) {
        closureRows.push({ ancestorUserId: ancestorId, descendantUserId: item.id, depth })
        ancestorId = byId.get(ancestorId)?.sponsorId ?? null
        depth++
      }
    }
    if (closureRows.length) await tx.insert(networkClosure).values(closureRows)

    await tx.insert(investmentReceipt).values(additions.map((item) => ({
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

    const [commissionRows, careerRows] = await Promise.all([tx.select().from(commissionLevel), tx.select().from(career)])
    const commissionByDepth = new Map(commissionRows.filter((row) => row.enabled).map((row) => [row.level, row]))
    const careerOrder = new Map(careerRows.map((row) => [row.code, row.displayOrder]))
    const occurredAt = new Date()
    const day = Math.max(2, simulation.currentDay)
    const credits = new Map<string, number>()
    const addCredit = (userId: string, amount: number) => credits.set(userId, Number(((credits.get(userId) ?? 0) + amount).toFixed(2)))
    const ledgerRows = additions.map((item) => ({ runKey: DEMO_RUN_KEY, userId: item.id, userName: item.name, veloxId: item.veloxId, entryType: 'demo_investment', amount: String(item.personalInvestment), status: 'confirmed_demo', reference: `DEMO-${item.veloxId}-INV`, occurredAt }))

    for (const item of additions) {
      const sponsor = item.sponsorId ? byId.get(item.sponsorId) : null
      if (sponsor) {
        const referral = Number((item.personalInvestment * DEMO_DIRECT_REFERRAL_RATE).toFixed(2))
        ledgerRows.push({ runKey: DEMO_RUN_KEY, userId: sponsor.id, userName: sponsor.name, veloxId: sponsor.veloxId, entryType: 'demo_referral_commission', amount: String(referral), status: 'accrued_demo', reference: `DEMO-${item.veloxId}-D${day}-REF6`, occurredAt })
        addCredit(sponsor.id, referral)
      }

      const accrual = Number((item.personalInvestment * (DEMO_DAILY_DISTRIBUTION_AVERAGE / 100)).toFixed(2))
      ledgerRows.push({ runKey: DEMO_RUN_KEY, userId: item.id, userName: item.name, veloxId: item.veloxId, entryType: 'demo_accrual', amount: String(accrual), status: 'accrued_demo', reference: `DEMO-${item.veloxId}-D${day}-ACC`, occurredAt })
      addCredit(item.id, accrual)

      let ancestorId = item.sponsorId
      let depth = 1
      while (ancestorId && depth <= 33) {
        const recipient = byId.get(ancestorId)
        const level = commissionByDepth.get(depth)
        if (!recipient || !level) break
        const requiredCareerOrder = careerOrder.get(level.requiredCareerCode) ?? 0
        const recipientCareerOrder = careerOrder.get(recipient.career) ?? 0
        if (recipientCareerOrder >= requiredCareerOrder) {
          const networkCommission = Number((accrual * (safeNumber(level.percentage) / 100)).toFixed(2))
          if (networkCommission > 0) {
            ledgerRows.push({ runKey: DEMO_RUN_KEY, userId: recipient.id, userName: recipient.name, veloxId: recipient.veloxId, entryType: 'demo_network_commission', amount: String(networkCommission), status: 'accrued_demo', reference: `DEMO-${item.veloxId}-D${day}-L${depth}-NET`, occurredAt })
            addCredit(recipient.id, networkCommission)
          }
        }
        ancestorId = recipient.sponsorId
        depth++
      }
    }
    for (const [userId, payout] of credits) {
      const recipient = byId.get(userId)
      if (!recipient || payout < 25) continue
      ledgerRows.push({ runKey: DEMO_RUN_KEY, userId: recipient.id, userName: recipient.name, veloxId: recipient.veloxId, entryType: 'demo_auto_withdrawal', amount: String(-payout), status: 'auto_withdrawn_demo', reference: `DEMO-${recipient.veloxId}-D${day}-WDL`, occurredAt })
    }
    await tx.insert(demoLedgerEntry).values(ledgerRows)

    const directCounts = new Map<string, number>()
    for (const item of targetMembers) if (item.sponsorId) directCounts.set(item.sponsorId, (directCounts.get(item.sponsorId) ?? 0) + 1)
    for (const [userId, directCount] of directCounts) await tx.update(member).set({ directCount }).where(eq(member.userId, userId))

    return { added: additions.length, total: existing.length + additions.length }
  })

  revalidatePath('/partners')
  revalidatePath('/admin')
  revalidatePath('/admin/network')
  revalidatePath('/admin/demo-simulation')
  revalidatePath('/admin/reports')
  return result
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

export async function loadCashbackAdmin() {
  await requireAdmin()
  return db.select().from(cashbackTier).orderBy(asc(cashbackTier.displayOrder))
}

/** Applies the agreed OneTrade-style demo ladder after explicit admin approval. */
export async function applyOneTradeCareerPlan() {
  await requireAdmin()
  await applyOneTradeCareerPlanDefaults()
  await applyOneTradeCashbackPlanDefaults()
  revalidatePath('/admin/careers')
  revalidatePath('/admin/commissions')
  revalidatePath('/career')
  revalidatePath('/network')
}

export async function updateCashbackTier(input: {
  id: number
  requiredTeamVolume: number
  requiredDirectPartners: number
  cashbackAmount: number
  dailyWithdrawalLimit: number
  enabled: boolean
}) {
  await requireAdmin()
  await db.update(cashbackTier).set({
    requiredTeamVolume: String(Math.max(0, safeNumber(input.requiredTeamVolume))),
    requiredDirectPartners: Math.max(0, Math.floor(safeNumber(input.requiredDirectPartners))),
    cashbackAmount: String(Math.max(0, safeNumber(input.cashbackAmount))),
    dailyWithdrawalLimit: String(Math.max(0, safeNumber(input.dailyWithdrawalLimit))),
    enabled: Boolean(input.enabled),
  }).where(eq(cashbackTier.id, input.id))
  revalidatePath('/admin/careers')
  revalidatePath('/network')
}

export async function updateCareer(input: {
  id: number
  unlockedDepth: number
  dailyWithdrawalLimit: number
  enabled: boolean
}) {
  await requireAdmin()
  await db
    .update(career)
    .set({
      unlockedDepth: Math.max(0, Math.min(33, Math.floor(safeNumber(input.unlockedDepth)))),
      dailyWithdrawalLimit: String(Math.max(0, safeNumber(input.dailyWithdrawalLimit))),
      // Cashback bağımsız bir programdır; kariyer kaydında ödül tutulmaz.
      careerReward: '0',
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
