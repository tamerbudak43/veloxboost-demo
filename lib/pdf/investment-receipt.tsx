import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer'
import { readFileSync } from 'node:fs'
import { getExportLanguage } from '@/lib/i18n/export-language'

export type ReceiptPdfData = {
  receiptNumber: string
  issuedAt: Date
  confirmedAt: Date | null
  memberName: string
  memberEmail: string
  amount: string
  asset: string
  network: string
  receivingAddress: string
  transactionHash: string | null
  status: string
}

const styles = StyleSheet.create({
  page: { padding: 42, fontFamily: 'VeloxDocument', color: '#10243a', fontSize: 9 },
  headerLogo: { width: 74, height: 54, objectFit: 'contain' },
  title: { marginTop: 8, fontSize: 18, fontFamily: 'VeloxDocument', fontWeight: 700, color: '#10243a' },
  subtitle: { marginTop: 5, fontSize: 9, color: '#526579' },
  rule: { height: 2, backgroundColor: '#00bde3', marginTop: 16, marginBottom: 18 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d9e3ea', paddingVertical: 8 },
  label: { width: '38%', color: '#526579' },
  value: { width: '62%', fontFamily: 'VeloxDocument', fontWeight: 700, textAlign: 'right' },
  section: { marginTop: 22, borderWidth: 1, borderColor: '#cbd9e3', borderRadius: 4, padding: 14 },
  sectionTitle: { fontSize: 10, fontFamily: 'VeloxDocument', fontWeight: 700, color: '#007fa5', marginBottom: 8 },
  note: { marginTop: 20, padding: 12, backgroundColor: '#eef8fb', color: '#385166', lineHeight: 1.45 },
  approval: { marginTop: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  seal: { width: 62, height: 62, opacity: 0.48 },
  signature: { width: 190, alignItems: 'center' },
  signatureLine: { width: '100%', borderTopWidth: 1, borderTopColor: '#526579', marginBottom: 6 },
  signatureTitle: { fontSize: 8.5, fontFamily: 'VeloxDocument', fontWeight: 700, color: '#10243a' },
  signatureSub: { marginTop: 2, fontSize: 7.5, color: '#526579' },
  footer: { position: 'absolute', left: 42, right: 42, bottom: 32, borderTopWidth: 1, borderTopColor: '#d9e3ea', paddingTop: 9, color: '#526579', fontSize: 7.5 },
})

const sealPath = `${process.cwd()}/public/assets/velox-singapore-seal.png`
const logoPath = `${process.cwd()}/public/assets/velox-logo-header-print.png`
const regularFontPath = `${process.cwd()}/public/assets/velox-document-regular.ttf`
const boldFontPath = `${process.cwd()}/public/assets/velox-document-bold.ttf`

function imageDataUri(path: string) {
  return `data:image/png;base64,${readFileSync(path).toString('base64')}`
}

// react-pdf does not reliably resolve filesystem paths after a Next.js server
// bundle. Embed the company assets so every downloaded receipt keeps its logo
// and seal.
const sealImage = imageDataUri(sealPath)
const logoImage = imageDataUri(logoPath)

Font.register({
  family: 'VeloxDocument',
  fonts: [
    { src: regularFontPath, fontWeight: 400 },
    { src: boldFontPath, fontWeight: 700 },
  ],
})

function date(value: Date | null, locale: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(value)
}

function Row({ label, value, rtl }: { label: string; value: string; rtl: boolean }) {
  return <View style={[styles.row, rtl ? { flexDirection: 'row-reverse' } : {}]}><Text style={[styles.label, rtl ? { textAlign: 'right' } : {}]}>{label}</Text><Text style={[styles.value, rtl ? { textAlign: 'left' } : {}]}>{value}</Text></View>
}

function InvestmentReceiptPdf({ data, language }: { data: ReceiptPdfData; language: string }) {
  const { t, locale, direction } = getExportLanguage(language)
  const rtl = direction === 'rtl'
  return (
    <Document title={`VELOX ${t('receiptTitle')} ${data.receiptNumber}`} author="VELOX">
      <Page size="A4" style={[styles.page, rtl ? { textAlign: 'right' } : {}]}>
        <Image src={logoImage} style={styles.headerLogo} />
        <Text style={styles.title}>{t('receiptTitle')}</Text>
        <Text style={styles.subtitle}>{t('receiptSubtitle')}</Text>
        <View style={styles.rule} />

        <Row rtl={rtl} label={t('documentNumber')} value={data.receiptNumber} />
        <Row rtl={rtl} label={t('issueDate')} value={date(data.issuedAt, locale)} />
        <Row rtl={rtl} label={t('confirmationDate')} value={date(data.confirmedAt, locale)} />
        <Row rtl={rtl} label={t('transactionStatus')} value={data.status === 'confirmed' ? t('confirmed') : data.status} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('memberInfo')}</Text>
          <Row rtl={rtl} label={t('fullName')} value={data.memberName} />
          <Row rtl={rtl} label={t('email')} value={data.memberEmail} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('investmentInfo')}</Text>
          <Row rtl={rtl} label={t('investmentAmount')} value={`${data.amount} ${data.asset}`} />
          <Row rtl={rtl} label={t('network')} value={data.network} />
          <Row rtl={rtl} label={t('receivingAddress')} value={data.receivingAddress} />
          <Row rtl={rtl} label={t('transactionHash')} value={data.transactionHash ?? '—'} />
        </View>

        <Text style={styles.note}>{t('receiptNote')}</Text>

        <View style={styles.approval}>
          <Image src={sealImage} style={styles.seal} />
          <View style={styles.signature}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>{t('electronicApproval')}</Text>
            <Text style={styles.signatureSub}>VELOX Operations • {date(data.confirmedAt, locale)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>{t('receiptFooter')}</Text>
      </Page>
    </Document>
  )
}

export async function renderInvestmentReceipt(data: ReceiptPdfData, language = 'en') {
  return renderToBuffer(<InvestmentReceiptPdf data={data} language={language} />)
}
