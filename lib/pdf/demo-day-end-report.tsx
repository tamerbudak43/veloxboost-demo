import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import type { DemoDailyReport, DemoPaymentDetail } from '@/lib/services/demo-report.service'

const s = StyleSheet.create({ page: { padding: 34, fontSize: 8, color: '#10243a' }, title: { fontSize: 18, fontWeight: 700, color: '#007fa5' }, sub: { marginTop: 5, color: '#526579' }, note: { marginTop: 10, padding: 8, backgroundColor: '#fff6df', color: '#6a5115' }, h: { marginTop: 16, padding: 7, backgroundColor: '#eaf7fb', fontSize: 10, fontWeight: 700 }, row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#dce6ec', paddingVertical: 5 }, cell: { width: '11%', fontSize: 7 }, wide: { width: '23%', fontSize: 7 }, amount: { width: '11%', fontSize: 7, textAlign: 'right' }, footer: { position: 'absolute', bottom: 24, left: 34, right: 34, fontSize: 7, color: '#526579' } })
const n = (value: number) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
const Row = ({ values }: { values: string[] }) => <View style={s.row}>{values.map((value, index) => <Text key={`${value}-${index}`} style={index === 0 ? s.wide : s.amount}>{value}</Text>)}</View>

export async function renderDemoDayEndReport(data: { daily: DemoDailyReport[]; payments: DemoPaymentDetail[]; endingCash: number }) {
  const current = data.daily.at(-1)
  return renderToBuffer(<Document title="VELOX Demo Gün Sonu Raporu" author="VELOX Demo"><Page size="A4" style={s.page}>
    <Text style={s.title}>DEMO GÜN SONU FİNANS RAPORU</Text><Text style={s.sub}>Senaryo verisi - gerçek ödeme, cüzdan ya da yatırım kaydı değildir.</Text>
    <Text style={s.note}>Arbitraj brüt getirisi %2,6 senaryo oranıdır. Doğrudan sponsor referral komisyonu, yeni referansın ilk yatırım tutarının bir defalık %6'sı olarak ayrı hesaplanır.</Text>
    <Text style={s.h}>GÜNLÜK FİNANS TABLOSU</Text><Row values={['Tarih', 'Giriş', 'Arb. brüt', 'Üye tah.', 'Ref. %6', 'Ödeme', 'K/Z', 'Kasa devir']} />
    {data.daily.map((row) => <Row key={row.date} values={[row.date, n(row.deposits), n(row.arbitrageGross), n(row.memberAccrual), n(row.referralExpense), n(row.automaticPayments), n(row.profitLoss), n(row.closingCash)]} />)}
    <Text style={s.h}>SON GÜN ÖZETİ - {current?.date ?? 'Veri yok'}</Text>
    {current && <><Row values={['Kasa açılış', n(current.openingCash), 'Devir', n(current.turnover), 'Ödeme kuyruğu', n(current.paymentQueue), 'Kasa kapanış', n(current.closingCash)]} /><Row values={['Toplam kasa', n(data.endingCash), 'Kayıt', String(current.registrations), 'Kümülatif üye', String(current.cumulativeMembers), 'Net K/Z', n(current.profitLoss)]} /></>}
    <Text style={s.h}>ÖDEME / AĞ DETAYI (son 30 kayıt)</Text><Row values={['Tarih', 'Üye', 'SIM ID', 'Tür', 'Tutar', 'Referans']} />
    {data.payments.slice(-30).reverse().map((item, index) => <Row key={`${item.reference}-${index}`} values={[item.date, item.name, item.veloxId, item.type === 'demo_auto_withdrawal' ? 'Demo oto. çekim' : 'Doğrudan ref. %6', n(item.amount), item.reference]} />)}
    <Text style={s.footer}>VELOX demo raporu - yalnız eğitim/simülasyon verisi - oluşturma: {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(new Date())}</Text>
  </Page></Document>)
}

export async function renderDemoGrowthReport(data: { daily: DemoDailyReport[] }) {
  return renderToBuffer(<Document title="VELOX Demo Ağ Büyüme Raporu" author="VELOX Demo"><Page size="A4" style={s.page}>
    <Text style={s.title}>DEMO AĞ BÜYÜME RAPORU</Text><Text style={s.sub}>Günlük kayıt hızı, kümülatif ağ ve kritik eşik görünümü.</Text><Text style={s.note}>Bu rapor sentetik kayıtlar üzerinden oluşturulur; gerçek üye veya gelir performansı anlamına gelmez.</Text>
    <Text style={s.h}>GÜNLÜK BÜYÜME TABLOSU</Text><Row values={['Tarih', 'Yeni kayıt', 'Toplam ağ', 'Günlük giriş', 'Önceki gün', 'Büyüme %', 'Kritik eşik', 'Kasa']} />
    {data.daily.map((row, index) => { const prev = data.daily[index - 1]?.cumulativeMembers ?? 0; const growth = prev ? ((row.cumulativeMembers - prev) / prev) * 100 : 0; const threshold = row.cumulativeMembers >= 50 ? '50+ ağ' : row.cumulativeMembers >= 25 ? '25+ ağ' : row.cumulativeMembers >= 10 ? '10+ ağ' : 'Başlangıç'; return <Row key={row.date} values={[row.date, String(row.registrations), String(row.cumulativeMembers), n(row.deposits), String(prev), `%${n(growth)}`, threshold, n(row.closingCash)]} /> })}
    <Text style={s.h}>KRİTİK SINIRLAR</Text><Text style={s.sub}>10 üye: ilk doğrulama • 25 üye: Bronze ağ eşiği • 50 üye: operasyon yoğunluğu • 100 üye: ölçek ve ödeme kuyruğu kontrolü.</Text>
    <Text style={s.footer}>VELOX demo ağ raporu - yalnız eğitim/simülasyon verisi.</Text>
  </Page></Document>)
}
