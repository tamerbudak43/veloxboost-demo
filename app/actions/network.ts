'use server'

import { getMyProfile } from '@/app/actions/member'
import { loadCareers, loadCashbackTiers, loadCommissionLevels, unlockedDepthFor } from '@/lib/network/config'
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
import { getDemoMarketScenarios } from '@/lib/network/demo-market-scenario'
import { buildDemoGrowthSimulation } from '@/lib/network/demo-growth-simulation'
import { evaluateCashback } from '@/lib/services/cashback.service'
import { buildDemoFinanceSummary } from '@/lib/services/demo-finance.service'
import type { CommissionRow } from '@/lib/network/types'

/**
 * Assembles the network explorer from the signed-in member and the persisted
 * closure table. There is intentionally no demo fallback: an empty network is
 * a valid state for a new member.
 */
export async function getNetworkData() {
  const profile = await getMyProfile()
  if (!profile) throw new Error('Üyelik profili bulunamadı.')

  const rootId = profile.userId
  const demoSimulationEnabled = process.env.VELOX_DEMO_SIMULATION !== 'false'
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

  const persistedMembers = rows.map((row) => ({
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
  const simulation = demoSimulationEnabled
    ? buildDemoGrowthSimulation({ userId: profile.userId, name: profile.name, veloxId: profile.veloxId, career: profile.career })
    : null
  // Once the admin creates the phase-1 test dataset, use those persisted
  // DEMO rows so the investor and admin views inspect the same test data.
  const hasPersistedDemo = persistedMembers.some((item) => item.id.startsWith('demo-sim-'))
  const members = hasPersistedDemo ? persistedMembers : simulation?.members ?? persistedMembers
  const currentCareer = (hasPersistedDemo || simulation) ? simulation?.simulation.projectedCareer ?? profile.career : profile.career

  const [careers, commissionLevels, cashbackTiers] = await Promise.all([loadCareers(), loadCommissionLevels(), loadCashbackTiers()])
  // The simulated view is a training dataset and exposes all configured
  // depths for review. It never changes the member's persisted career.
  const unlockedDepth = (hasPersistedDemo || simulation) ? 33 : unlockedDepthFor(careers, currentCareer)

  const summary = networkSummary(members, rootId, currentCareer)
  const tree = buildSponsorTree(members, rootId)
  const legs = legSummaries(members, rootId)
  const depthRows = buildDepthRows(members, rootId, commissionLevels, unlockedDepth)
  const memberList = buildMemberList(members, rootId)
  // Commission history must be read from immutable ledger/earning records.
  // Until that phase is implemented, never fabricate an earning from volume.
  const earnings: CommissionRow[] = []

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
  const cashbackQualification = evaluateCashback(summary.teamVolume, summary.activePartners, cashbackTiers)
  const activeScenario = getDemoMarketScenarios().find((scenario) => scenario.active) ?? getDemoMarketScenarios()[0]
  const networkCommissionAllocation = depthRows
    .filter((row) => row.unlocked)
    .reduce((total, row) => total + row.investment * ((activeScenario?.rate ?? 0) / 100) * (row.commissionRate / 100), 0)
  const demoFinance = buildDemoFinanceSummary({
    teamVolume: summary.teamVolume,
    distributionRate: activeScenario?.rate ?? 0,
    networkCommissionAllocation,
    cashbackAllocation: cashbackQualification.currentTier?.cashbackAmount ?? 0,
  })

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
    marketScenarios: getDemoMarketScenarios(),
    cashbackQualification,
    demoFinance,
    simulation: simulation?.simulation ?? null,
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
  const careers = await loadCareers()
  return {
    summary: data.summary,
    careerProgress: data.careerProgress,
    careers,
    unlockedDepth: data.unlockedDepth,
  }
}

const DEMO_LOCATIONS = [
  { city: 'İstanbul', country: 'Türkiye', code: 'TR' },
  { city: 'Ankara', country: 'Türkiye', code: 'TR' },
  { city: 'İzmir', country: 'Türkiye', code: 'TR' },
  { city: 'Antalya', country: 'Türkiye', code: 'TR' },
  { city: 'Bursa', country: 'Türkiye', code: 'TR' },
  { city: 'Berlin', country: 'Almanya', code: 'DE' },
  { city: 'Köln', country: 'Almanya', code: 'DE' },
  { city: 'Almatı', country: 'Kazakistan', code: 'KZ' },
  { city: 'Astana', country: 'Kazakistan', code: 'KZ' },
  { city: 'Bakü', country: 'Azerbaycan', code: 'AZ' },
  { city: 'Tiflis', country: 'Gürcistan', code: 'GE' },
  { city: 'Dubai', country: 'Birleşik Arap Emirlikleri', code: 'AE' },
  { city: 'Moskova', country: 'Rusya', code: 'RU' },
  { city: 'Taşkent', country: 'Özbekistan', code: 'UZ' },
]

function demoLocationFor(seed: string) {
  const value = [...seed].reduce((total, character) => total + character.charCodeAt(0), 0)
  return DEMO_LOCATIONS[value % DEMO_LOCATIONS.length]
}

function istanbulDay(value: string | Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}

/** Compact signed-in member landing dashboard. Geographic rows are explicitly
 * synthetic until production registration/IP location capture is enabled. */
export async function getUserDashboardData() {
  const [network, directs, profile] = await Promise.all([
    getNetworkData(),
    getDirectReferralDashboardData(),
    getMyProfile(),
  ])
  if (!profile) throw new Error('Üyelik profili bulunamadı.')

  const members = network.memberList
  const latestDay = members.map((item) => istanbulDay(item.joinedAt)).sort().at(-1) ?? istanbulDay(new Date())
  const latestMembers = members.filter((item) => istanbulDay(item.joinedAt) === latestDay)
  const cityMap = new Map<string, { city: string; country: string; code: string; members: number; volume: number }>()
  for (const item of members) {
    const location = demoLocationFor(item.veloxId)
    const key = `${location.code}-${location.city}`
    const current = cityMap.get(key) ?? { ...location, members: 0, volume: 0 }
    current.members += 1
    current.volume += safeNumber(item.personalInvestment || item.personalVolume)
    cityMap.set(key, current)
  }
  const cities = [...cityMap.values()].sort((a, b) => b.members - a.members || b.volume - a.volume)
  const countryMap = new Map<string, { country: string; code: string; members: number; volume: number }>()
  for (const city of cities) {
    const current = countryMap.get(city.code) ?? { country: city.country, code: city.code, members: 0, volume: 0 }
    current.members += city.members
    current.volume += city.volume
    countryMap.set(city.code, current)
  }
  const countries = [...countryMap.values()].sort((a, b) => b.members - a.members || b.volume - a.volume)
  const growthMap = new Map<string, number>()
  for (const item of members) {
    const day = istanbulDay(item.joinedAt)
    growthMap.set(day, (growthMap.get(day) ?? 0) + 1)
  }
  const growth = [...growthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-7).map(([date, registrations]) => ({ date, registrations }))

  return {
    profile: { name: profile.name, veloxId: profile.veloxId, career: network.summary.currentCareer, balance: safeNumber(profile.balance) },
    summary: network.summary,
    latestDay,
    todayRegistrations: latestMembers.length,
    recentMembers: [...members].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)).slice(0, 8),
    directCommission: directs.simulatedCommission,
    networkIncome: network.demoFinance.networkCommissionAllocation,
    cashback: network.cashbackQualification.currentTier?.cashbackAmount ?? 0,
    cities,
    countries,
    growth,
    syntheticLocations: true,
  }
}
