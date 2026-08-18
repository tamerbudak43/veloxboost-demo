import 'server-only'

import { asc, eq, like } from 'drizzle-orm'
import { db } from '@/lib/db'
import { demoLedgerEntry, member } from '@/lib/db/schema'
import { safeNumber } from '@/lib/format'

const RUN_KEY = 'phase-1-growth-v1'

export type DemoDailyReport = {
  date: string
  registrations: number
  cumulativeMembers: number
  deposits: number
  arbitrageGross: number
  memberAccrual: number
  referralExpense: number
  networkIncome: number
  cashback: number
  totalDistribution: number
  automaticPayments: number
  paymentQueue: number
  profitLoss: number
  openingCash: number
  closingCash: number
  turnover: number
}

export type DemoCountryReport = {
  country: string
  code: string
  city: string
  lat: number
  lng: number
  members: number
  deposits: number
}

export type DemoCityReport = DemoCountryReport

// Phase-1 test members do not represent real users or real locations. This
// deterministic list exists solely to make the global-demo dashboard readable.
const DEMO_COUNTRY_ROTATION = [
  { country: 'Türkiye', code: 'TR', city: 'Ankara', lat: 39.9334, lng: 32.8597 },
  { country: 'Almanya', code: 'DE', city: 'Berlin', lat: 52.52, lng: 13.405 },
  { country: 'Azerbaycan', code: 'AZ', city: 'Bakü', lat: 40.4093, lng: 49.8671 },
  { country: 'Kazakistan', code: 'KZ', city: 'Almatı', lat: 43.222, lng: 76.8512 },
  { country: 'Birleşik Arap Emirlikleri', code: 'AE', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { country: 'Rusya', code: 'RU', city: 'Moskova', lat: 55.7558, lng: 37.6173 },
  { country: 'Özbekistan', code: 'UZ', city: 'Taşkent', lat: 41.2995, lng: 69.2401 },
  { country: 'Gürcistan', code: 'GE', city: 'Tiflis', lat: 41.7151, lng: 44.8271 },
] as const

const DEMO_CITY_ROTATION: Record<string, Array<{ city: string; lat: number; lng: number }>> = {
  TR: [{ city: 'Ankara', lat: 39.9334, lng: 32.8597 }, { city: 'İstanbul', lat: 41.0082, lng: 28.9784 }, { city: 'İzmir', lat: 38.4237, lng: 27.1428 }, { city: 'Antalya', lat: 36.8969, lng: 30.7133 }, { city: 'Bursa', lat: 40.195, lng: 29.06 }],
  DE: [{ city: 'Berlin', lat: 52.52, lng: 13.405 }, { city: 'Köln', lat: 50.9375, lng: 6.9603 }], AZ: [{ city: 'Bakü', lat: 40.4093, lng: 49.8671 }], KZ: [{ city: 'Almatı', lat: 43.222, lng: 76.8512 }, { city: 'Astana', lat: 51.1694, lng: 71.4491 }], AE: [{ city: 'Dubai', lat: 25.2048, lng: 55.2708 }, { city: 'Abu Dabi', lat: 24.4539, lng: 54.3773 }], RU: [{ city: 'Moskova', lat: 55.7558, lng: 37.6173 }], UZ: [{ city: 'Taşkent', lat: 41.2995, lng: 69.2401 }], GE: [{ city: 'Tiflis', lat: 41.7151, lng: 44.8271 }],
}

function demoCountryFor(userId: string) {
  const serial = Number(userId.match(/(\d+)$/)?.[1] ?? 0)
  return DEMO_COUNTRY_ROTATION[Math.max(0, serial - 1) % DEMO_COUNTRY_ROTATION.length]
}
function demoCityFor(userId: string) {
  const serial = Number(userId.match(/(\d+)$/)?.[1] ?? 1)
  const country = demoCountryFor(userId)
  const cities = DEMO_CITY_ROTATION[country.code]
  return { ...country, ...cities[Math.floor((serial - 1) / DEMO_COUNTRY_ROTATION.length) % cities.length] }
}

export type DemoPaymentDetail = {
  date: string
  name: string
  veloxId: string
  type: string
  amount: number
  reference: string
}

function dayKey(value: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(value)
}

export async function loadDemoReports() {
  const [ledger, members] = await Promise.all([
    db.select().from(demoLedgerEntry).where(eq(demoLedgerEntry.runKey, RUN_KEY)).orderBy(asc(demoLedgerEntry.occurredAt)),
    db.select().from(member).where(like(member.userId, 'demo-sim-%')).orderBy(asc(member.createdAt)),
  ])
  const dates = new Set<string>()
  members.forEach((row) => dates.add(dayKey(row.createdAt)))
  ledger.forEach((row) => dates.add(dayKey(row.occurredAt)))
  const orderedDates = [...dates].sort()
  let cash = 0
  let paymentQueue = 0
  let cumulativeMembers = 0
  const daily: DemoDailyReport[] = orderedDates.map((date) => {
    const newMembers = members.filter((row) => dayKey(row.createdAt) === date)
    cumulativeMembers += newMembers.length
    const rows = ledger.filter((row) => dayKey(row.occurredAt) === date)
    const sum = (type: string) => rows.filter((row) => row.entryType === type).reduce((total, row) => total + safeNumber(row.amount), 0)
    const deposits = sum('demo_investment')
    const arbitrageGross = sum('demo_arbitrage_income')
    const memberAccrual = sum('demo_accrual')
    const referralExpense = sum('demo_referral_commission')
    const networkIncome = sum('demo_network_commission')
    const cashback = sum('demo_cashback')
    const automaticPayments = Math.abs(sum('demo_auto_withdrawal'))
    // Pending credits carry forward until the scenario's 25 USDT automatic
    // withdrawal threshold is reached, matching the demo ledger behaviour.
    const totalDistribution = memberAccrual + referralExpense + networkIncome + cashback
    paymentQueue = Math.max(0, paymentQueue + totalDistribution - automaticPayments)
    const openingCash = cash
    cash += deposits + arbitrageGross - automaticPayments
    return {
      date, registrations: newMembers.length, cumulativeMembers, deposits, arbitrageGross, memberAccrual, referralExpense, networkIncome, cashback, totalDistribution,
      automaticPayments, paymentQueue, profitLoss: arbitrageGross - totalDistribution,
      openingCash, closingCash: cash, turnover: deposits + arbitrageGross,
    }
  })
  const payments: DemoPaymentDetail[] = ledger
    .filter((row) => row.entryType === 'demo_auto_withdrawal' || row.entryType === 'demo_referral_commission' || row.entryType === 'demo_network_commission' || row.entryType === 'demo_cashback')
    .map((row) => ({ date: dayKey(row.occurredAt), name: row.userName, veloxId: row.veloxId, type: row.entryType, amount: safeNumber(row.amount), reference: row.reference }))
  const totals = daily.reduce((total, row) => ({
    deposits: total.deposits + row.deposits, arbitrageGross: total.arbitrageGross + row.arbitrageGross,
    memberAccrual: total.memberAccrual + row.memberAccrual, referralExpense: total.referralExpense + row.referralExpense, networkIncome: total.networkIncome + row.networkIncome, cashback: total.cashback + row.cashback,
    automaticPayments: total.automaticPayments + row.automaticPayments, profitLoss: total.profitLoss + row.profitLoss,
    turnover: total.turnover + row.turnover,
  }), { deposits: 0, arbitrageGross: 0, memberAccrual: 0, referralExpense: 0, networkIncome: 0, cashback: 0, automaticPayments: 0, profitLoss: 0, turnover: 0 })
  const countryMap = new Map<string, DemoCountryReport>()
  for (const item of members) {
    const identity = demoCountryFor(item.userId)
    const current = countryMap.get(identity.code) ?? { ...identity, members: 0, deposits: 0 }
    current.members += 1
    current.deposits += safeNumber(item.personalVolume)
    countryMap.set(identity.code, current)
  }
  const countries = [...countryMap.values()].sort((a, b) => b.deposits - a.deposits)
  const cityMap = new Map<string, DemoCityReport>()
  for (const item of members) { const identity = demoCityFor(item.userId); const key = `${identity.code}-${identity.city}`; const current = cityMap.get(key) ?? { ...identity, members: 0, deposits: 0 }; current.members += 1; current.deposits += safeNumber(item.personalVolume); cityMap.set(key, current) }
  const cities = [...cityMap.values()].sort((a, b) => b.deposits - a.deposits)
  return { daily, payments, totals, countries, cities, endingCash: daily.at(-1)?.closingCash ?? 0 }
}
