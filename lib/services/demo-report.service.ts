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
  automaticPayments: number
  paymentQueue: number
  profitLoss: number
  openingCash: number
  closingCash: number
  turnover: number
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
    const automaticPayments = Math.abs(sum('demo_auto_withdrawal'))
    // Pending credits carry forward until the scenario's 25 USDT automatic
    // withdrawal threshold is reached, matching the demo ledger behaviour.
    paymentQueue = Math.max(0, paymentQueue + memberAccrual + referralExpense - automaticPayments)
    const openingCash = cash
    cash += deposits + arbitrageGross - automaticPayments
    return {
      date, registrations: newMembers.length, cumulativeMembers, deposits, arbitrageGross, memberAccrual, referralExpense,
      automaticPayments, paymentQueue, profitLoss: arbitrageGross - memberAccrual - referralExpense,
      openingCash, closingCash: cash, turnover: deposits + arbitrageGross,
    }
  })
  const payments: DemoPaymentDetail[] = ledger
    .filter((row) => row.entryType === 'demo_auto_withdrawal' || row.entryType === 'demo_referral_commission')
    .map((row) => ({ date: dayKey(row.occurredAt), name: row.userName, veloxId: row.veloxId, type: row.entryType, amount: safeNumber(row.amount), reference: row.reference }))
  const totals = daily.reduce((total, row) => ({
    deposits: total.deposits + row.deposits, arbitrageGross: total.arbitrageGross + row.arbitrageGross,
    memberAccrual: total.memberAccrual + row.memberAccrual, referralExpense: total.referralExpense + row.referralExpense,
    automaticPayments: total.automaticPayments + row.automaticPayments, profitLoss: total.profitLoss + row.profitLoss,
    turnover: total.turnover + row.turnover,
  }), { deposits: 0, arbitrageGross: 0, memberAccrual: 0, referralExpense: 0, automaticPayments: 0, profitLoss: 0, turnover: 0 })
  return { daily, payments, totals, endingCash: daily.at(-1)?.closingCash ?? 0 }
}
