import { Document, Font, Page, Path, Svg, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import path from 'node:path'
import type { DemoDailyReport, DemoPaymentDetail } from '@/lib/services/demo-report.service'
import { getExportLanguage } from '@/lib/i18n/export-language'

const pdfAssets = path.join(process.cwd(), 'public', 'assets')

// React-PDF'nin varsayılan Helvetica yazı tipi Türkçe karakterleri tam kapsamaz.
// Bu iki dosya tam Unicode DejaVu Sans sürümüdür; İ/ı/Ş/ş/Ğ/ğ/Ü/ü/Ö/ö/Ç/ç karakterleri PDF içine gömülür.
Font.register({ family: 'VeloxUnicode', src: path.join(pdfAssets, 'velox-pdf-unicode-regular.ttf'), fontWeight: 400 })
Font.register({ family: 'VeloxUnicode', src: path.join(pdfAssets, 'velox-pdf-unicode-bold.ttf'), fontWeight: 700 })

const s = StyleSheet.create({
  page: { padding: 34, fontFamily: 'VeloxUnicode', fontSize: 8, color: '#10243a' },
  brand: { position: 'absolute', top: 20, right: 34, flexDirection: 'row', alignItems: 'center' },
  brandWord: { marginLeft: 5, fontFamily: 'VeloxUnicode', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#005e8d' },
  brandTag: { marginLeft: 5, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, backgroundColor: '#eaf7fb', color: '#007fa5', fontSize: 5.5, fontWeight: 700 },
  title: { fontFamily: 'VeloxUnicode', fontSize: 18, fontWeight: 700, color: '#007fa5' },
  sub: { marginTop: 5, color: '#526579' },
  note: { marginTop: 10, padding: 8, backgroundColor: '#fff6df', color: '#6a5115' },
  h: { marginTop: 16, padding: 7, backgroundColor: '#eaf7fb', fontSize: 10, fontWeight: 700 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#dce6ec', paddingVertical: 5 },
  cell: { width: '11%', fontSize: 7 },
  wide: { width: '23%', fontSize: 7 },
  amount: { width: '11%', fontSize: 7, textAlign: 'right' },
  footer: { position: 'absolute', bottom: 24, left: 34, right: 34, fontSize: 7, color: '#526579' },
})
const n = (value: number, locale: string) => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
const Row = ({ values, rtl = false }: { values: string[]; rtl?: boolean }) => <View style={[s.row, rtl ? { flexDirection: 'row-reverse' } : {}]}>{values.map((value, index) => <Text key={`${value}-${index}`} style={[s.cell, { width: `${100 / values.length}%`, textAlign: rtl ? (index === 0 ? 'right' : 'left') : (index === 0 ? 'left' : 'right') }]}>{value}</Text>)}</View>
const PdfBrand = () => <View style={s.brand} fixed>
  <Svg width={20} height={20} viewBox="0 0 64 64">
    <Path d="M4 14 L34 14 L26 30 L20 30 Z" fill="#0877E8" />
    <Path d="M34 14 L60 14 L40 24 L30 24 Z" fill="#18D4E8" />
    <Path d="M20 30 L40 24 L30 52 L24 42 Z" fill="#063F9F" />
  </Svg>
  <Text style={s.brandWord}>VELOX</Text><Text style={s.brandTag}>DEMO</Text>
</View>

export async function renderDemoDayEndReport(data: { daily: DemoDailyReport[]; payments: DemoPaymentDetail[]; endingCash: number }, language = 'en') {
  const { t, locale, direction } = getExportLanguage(language)
  const rtl = direction === 'rtl'
  const current = data.daily.at(-1)
  return renderToBuffer(<Document title={t('financeTitle')} author="VELOX Demo"><Page size="A4" style={[s.page, rtl ? { textAlign: 'right' } : {}]}>
    <PdfBrand />
    <Text style={s.title}>{t('financeTitle')}</Text><Text style={s.sub}>{t('simulationNote')}</Text>
    <Text style={s.note}>{t('simulationNote')}</Text>
    <Text style={s.h}>{t('financeTitle')}</Text><Row rtl={rtl} values={[t('date'), t('deposit'), 'Arb.', t('investmentDistribution'), 'Ref. 6%', t('networkIncome'), t('cashback'), t('totalDistribution'), t('automaticPayment'), t('profitLoss'), t('closingCash')]} />
    {data.daily.map((row) => <Row rtl={rtl} key={row.date} values={[row.date, n(row.deposits, locale), n(row.arbitrageGross, locale), n(row.memberAccrual, locale), n(row.referralExpense, locale), n(row.networkIncome, locale), n(row.cashback, locale), n(row.totalDistribution, locale), n(row.automaticPayments, locale), n(row.profitLoss, locale), n(row.closingCash, locale)]} />)}
    <Text style={s.h}>{t('reportEnd')} - {current?.date ?? t('noData')}</Text>
    {current && <><Row rtl={rtl} values={[t('closingCash'), n(current.openingCash, locale), t('totalDistribution'), n(current.turnover, locale), t('paymentQueue'), n(current.paymentQueue, locale), t('closingCash'), n(current.closingCash, locale)]} /><Row rtl={rtl} values={[t('closingCash'), n(data.endingCash, locale), t('newRegistrations'), String(current.registrations), t('totalNetwork'), String(current.cumulativeMembers), t('profitLoss'), n(current.profitLoss, locale)]} /></>}
    <Text style={s.h}>{t('paymentDetails')}</Text><Row rtl={rtl} values={[t('date'), t('member'), 'SIM ID', t('type'), t('amount'), t('reference')]} />
    {data.payments.slice(-30).reverse().map((item, index) => <Row rtl={rtl} key={`${item.reference}-${index}`} values={[item.date, item.name, item.veloxId, item.type, n(item.amount, locale), item.reference]} />)}
    <Text style={s.footer}>VELOX demo • {t('simulationNote')} • {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(new Date())}</Text>
  </Page></Document>)
}

export async function renderDemoGrowthReport(data: { daily: DemoDailyReport[] }, language = 'en') {
  const { t, locale, direction } = getExportLanguage(language)
  const rtl = direction === 'rtl'
  return renderToBuffer(<Document title={t('growthTitle')} author="VELOX Demo"><Page size="A4" style={[s.page, rtl ? { textAlign: 'right' } : {}]}>
    <PdfBrand />
    <Text style={s.title}>{t('growthTitle')}</Text><Text style={s.sub}>{t('simulationNote')}</Text><Text style={s.note}>{t('simulationNote')}</Text>
    <Text style={s.h}>{t('growthTitle')}</Text><Row rtl={rtl} values={[t('date'), t('newRegistrations'), t('totalNetwork'), t('deposit'), t('previousNetwork'), t('growth'), t('threshold'), t('closingCash')]} />
    {data.daily.map((row, index) => { const prev = data.daily[index - 1]?.cumulativeMembers ?? 0; const growth = prev ? ((row.cumulativeMembers - prev) / prev) * 100 : 0; const threshold = row.cumulativeMembers >= 50 ? `50+ ${t('threshold')}` : row.cumulativeMembers >= 25 ? '25+ Bronze' : row.cumulativeMembers >= 10 ? `10+ ${t('confirmed')}` : t('starting'); return <Row rtl={rtl} key={row.date} values={[row.date, String(row.registrations), String(row.cumulativeMembers), n(row.deposits, locale), String(prev), `%${n(growth, locale)}`, threshold, n(row.closingCash, locale)]} /> })}
    <Text style={s.h}>{t('threshold')}</Text><Text style={s.sub}>10 • 25 • 50 • 100</Text>
    <Text style={s.footer}>VELOX demo • {t('simulationNote')}</Text>
  </Page></Document>)
}
