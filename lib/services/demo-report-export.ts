import 'server-only'

import type { DemoDailyReport, DemoPaymentDetail } from '@/lib/services/demo-report.service'
import { getExportLanguage } from '@/lib/i18n/export-language'

function escapeCsv(value: string | number) {
  const normalized = String(value).replace(/"/g, '""')
  return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized
}

function amount(value: number) {
  return value.toFixed(2)
}

/**
 * Excel-compatible UTF-8 CSV export. It intentionally contains only the
 * synthetic demo ledger and is never a payment or wallet export.
 */
export function renderDemoReportCsv(
  kind: 'finance' | 'growth',
  data: { daily: DemoDailyReport[]; payments: DemoPaymentDetail[]; endingCash: number },
  language = 'en',
) {
  const { t } = getExportLanguage(language)
  const rows: Array<Array<string | number>> = []
  rows.push([kind === 'finance' ? t('financeTitle') : t('growthTitle')])
  rows.push([t('simulationNote')])
  rows.push([])

  if (kind === 'finance') {
    rows.push([t('date'), t('newRegistrations'), t('deposit'), t('arbitrageGross'), t('investmentDistribution'), t('referral'), t('networkIncome'), t('cashback'), t('totalDistribution'), t('automaticPayment'), t('paymentQueue'), t('profitLoss'), t('closingCash')])
    data.daily.forEach((row) => rows.push([
      row.date, row.registrations, amount(row.deposits), amount(row.arbitrageGross), amount(row.memberAccrual),
      amount(row.referralExpense), amount(row.networkIncome), amount(row.cashback), amount(row.totalDistribution), amount(row.automaticPayments), amount(row.paymentQueue), amount(row.profitLoss), amount(row.closingCash),
    ]))
    rows.push([])
    rows.push([t('paymentDetails')])
    rows.push([t('date'), t('member'), 'VELOX ID', t('type'), t('amount'), t('reference')])
    data.payments.forEach((row) => rows.push([row.date, row.name, row.veloxId, row.type, amount(row.amount), row.reference]))
  } else {
    rows.push([t('date'), t('newRegistrations'), t('totalNetwork'), t('deposit'), t('previousNetwork'), t('growth'), t('threshold'), t('closingCash')])
    data.daily.forEach((row, index) => {
      const previous = data.daily[index - 1]?.cumulativeMembers ?? 0
      const growth = previous ? ((row.cumulativeMembers - previous) / previous) * 100 : 0
      const threshold = row.cumulativeMembers >= 100 ? `100+ ${t('threshold')}` : row.cumulativeMembers >= 50 ? `50+ ${t('threshold')}` : row.cumulativeMembers >= 25 ? '25+ Bronze' : row.cumulativeMembers >= 10 ? `10+ ${t('confirmed')}` : t('starting')
      rows.push([row.date, row.registrations, row.cumulativeMembers, amount(row.deposits), previous, amount(growth), threshold, amount(row.closingCash)])
    })
  }

  rows.push([])
  rows.push([t('reportEnd'), t('closingCash'), amount(data.endingCash)])
  return `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`
}
