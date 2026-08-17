import 'server-only'

import type { DemoDailyReport, DemoPaymentDetail } from '@/lib/services/demo-report.service'

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
) {
  const rows: Array<Array<string | number>> = []
  rows.push([kind === 'finance' ? 'VELOX DEMO GÜN SONU FİNANS RAPORU' : 'VELOX DEMO AĞ BÜYÜME RAPORU'])
  rows.push(['Yalnız eğitim ve simülasyon verisidir. Gerçek ödeme, cüzdan veya yatırım hareketi değildir.'])
  rows.push([])

  if (kind === 'finance') {
    rows.push(['Tarih', 'Yeni kayıt', 'Giriş USDT', 'Arbitraj brüt USDT', 'Üye tahakkuku USDT', 'Doğrudan referral %6 USDT', 'Otomatik ödeme USDT', 'Ödeme kuyruğu USDT', 'Net K/Z USDT', 'Kasa devir USDT'])
    data.daily.forEach((row) => rows.push([
      row.date, row.registrations, amount(row.deposits), amount(row.arbitrageGross), amount(row.memberAccrual),
      amount(row.referralExpense), amount(row.automaticPayments), amount(row.paymentQueue), amount(row.profitLoss), amount(row.closingCash),
    ]))
    rows.push([])
    rows.push(['Ödeme / ağ detayları'])
    rows.push(['Tarih', 'Üye', 'VELOX ID', 'Tür', 'Tutar USDT', 'Referans'])
    data.payments.forEach((row) => rows.push([row.date, row.name, row.veloxId, row.type, amount(row.amount), row.reference]))
  } else {
    rows.push(['Tarih', 'Yeni kayıt', 'Kümülatif ağ', 'Günlük giriş USDT', 'Önceki gün ağ', 'Büyüme %', 'Kritik sınır', 'Kasa devir USDT'])
    data.daily.forEach((row, index) => {
      const previous = data.daily[index - 1]?.cumulativeMembers ?? 0
      const growth = previous ? ((row.cumulativeMembers - previous) / previous) * 100 : 0
      const threshold = row.cumulativeMembers >= 100 ? '100+ ölçek kontrolü' : row.cumulativeMembers >= 50 ? '50+ operasyon yoğunluğu' : row.cumulativeMembers >= 25 ? '25+ Bronze ağ eşiği' : row.cumulativeMembers >= 10 ? '10+ ilk doğrulama' : 'Başlangıç'
      rows.push([row.date, row.registrations, row.cumulativeMembers, amount(row.deposits), previous, amount(growth), threshold, amount(row.closingCash)])
    })
  }

  rows.push([])
  rows.push(['Rapor sonu', 'Kasa kapanış', amount(data.endingCash)])
  return `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`
}
