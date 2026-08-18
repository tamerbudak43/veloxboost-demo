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
import {
  formatPdfDate,
  pdfDirection,
  pdfFontFamily,
  pdfText,
  type PdfLanguage,
} from './pdf-i18n'

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
  depositMemo: string | null
  transactionHash: string | null
  status: string
}

const styles = StyleSheet.create({
  page: { padding: 42, color: '#10243a', fontSize: 9 },
  headerLogo: { width: 74, height: 54, objectFit: 'contain' },
  title: { marginTop: 8, fontSize: 18, fontWeight: 700, color: '#10243a' },
  subtitle: { marginTop: 5, fontSize: 9, color: '#526579' },
  rule: { height: 2, backgroundColor: '#00bde3', marginTop: 16, marginBottom: 18 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d9e3ea', paddingVertical: 5.5 },
  label: { width: '38%', color: '#526579' },
  value: { width: '62%', fontWeight: 700, textAlign: 'right' },
  section: { marginTop: 16, borderWidth: 1, borderColor: '#cbd9e3', borderRadius: 4, padding: 12 },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#007fa5', marginBottom: 8 },
  note: { marginTop: 14, padding: 10, backgroundColor: '#eef8fb', color: '#385166', lineHeight: 1.35 },
  approval: { marginTop: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  seal: { width: 62, height: 62, opacity: 0.48 },
  signature: { width: 190, alignItems: 'center' },
  signatureLine: { width: '100%', borderTopWidth: 1, borderTopColor: '#526579', marginBottom: 6 },
  signatureTitle: { fontSize: 8.5, fontWeight: 700, color: '#10243a' },
  signatureSub: { marginTop: 2, fontSize: 7.5, color: '#526579' },
  footer: { position: 'absolute', left: 42, right: 42, bottom: 32, borderTopWidth: 1, borderTopColor: '#d9e3ea', paddingTop: 9, color: '#526579', fontSize: 7.5 },
})

const sealPath = `${process.cwd()}/public/assets/velox-singapore-seal.png`
const logoPath = `${process.cwd()}/public/assets/velox-logo-header-print.png`
const regularFontPath = `${process.cwd()}/public/assets/velox-document-regular.ttf`
const boldFontPath = `${process.cwd()}/public/assets/velox-document-bold.ttf`
const cjkRegularFontPath = `${process.cwd()}/public/assets/velox-pdf-cjk-regular.woff`
const cjkBoldFontPath = `${process.cwd()}/public/assets/velox-pdf-cjk-bold.woff`

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

Font.register({
  family: 'VeloxCjk',
  fonts: [
    { src: cjkRegularFontPath, fontWeight: 400 },
    { src: cjkBoldFontPath, fontWeight: 700 },
  ],
})

function Row({ label, value, rtl, compactValue = false }: { label: string; value: string; rtl: boolean; compactValue?: boolean }) {
  return <View style={[styles.row, { flexDirection: rtl ? 'row-reverse' : 'row' }]}> 
    <Text style={[styles.label, { textAlign: rtl ? 'right' : 'left' }]}>{label}</Text>
    <Text style={[styles.value, { textAlign: rtl ? 'left' : 'right' }, compactValue ? { fontSize: 6.2 } : {}]}>{value}</Text>
  </View>
}

function InvestmentReceiptPdf({ data, language }: { data: ReceiptPdfData; language: PdfLanguage }) {
  const t = (source: string) => pdfText(language, source)
  const rtl = pdfDirection(language) === 'rtl'
  const fontFamily = pdfFontFamily(language)
  const status = data.status === 'confirmed' ? t('Doğrulandı') : data.status === 'rejected' ? t('Reddedildi') : t('Bekliyor')
  return (
    <Document title={`VELOX ${t('YATIRIM İŞLEM BELGESİ')} ${data.receiptNumber}`} author="VELOX">
      <Page size="A4" style={[styles.page, { fontFamily, direction: pdfDirection(language) }]}>
        <Image src={logoImage} style={styles.headerLogo} />
        <Text style={[styles.title, { textAlign: rtl ? 'right' : 'left' }]}>{t('YATIRIM İŞLEM BELGESİ')}</Text>
        <Text style={[styles.subtitle, { textAlign: rtl ? 'right' : 'left' }]}>{t('Doğrulanmış dijital varlık yatırımı işlem özeti')}</Text>
        <View style={styles.rule} />

        <Row rtl={rtl} label={t('Belge numarası')} value={data.receiptNumber} />
        <Row rtl={rtl} label={t('Belge oluşturma tarihi')} value={formatPdfDate(data.issuedAt, language)} />
        <Row rtl={rtl} label={t('Ağ doğrulama tarihi')} value={formatPdfDate(data.confirmedAt, language)} />
        <Row rtl={rtl} label={t('İşlem durumu')} value={status} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>{t('ÜYE BİLGİLERİ')}</Text>
          <Row rtl={rtl} label={t('Ad soyad')} value={data.memberName} />
          <Row rtl={rtl} label={t('E-posta')} value={data.memberEmail} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>{t('YATIRIM BİLGİLERİ')}</Text>
          <Row rtl={rtl} label={t('Yatırım tutarı')} value={`${data.amount} ${data.asset}`} />
          <Row rtl={rtl} label={t('Ağ')} value={data.network} />
          <Row rtl={rtl} label={t('Alıcı adresi')} value={data.receivingAddress} />
          {data.depositMemo ? <Row rtl={rtl} label={t('Memo / Etiket')} value={data.depositMemo} compactValue /> : null}
          <Row rtl={rtl} label={t('İşlem hash')} value={data.transactionHash ?? '—'} compactValue />
        </View>

        <Text style={[styles.note, { textAlign: rtl ? 'right' : 'left' }]}>
          {t('Bu belge VELOX platformundaki doğrulanmış yatırım işleminin özetidir. Resmî vergi faturası, kâr taahhüdü veya yatırım tavsiyesi değildir. İşlem hash değeri, ilgili blok zinciri kaydından bağımsız olarak doğrulanabilir.')}
        </Text>

        <View style={styles.approval}>
          <Image src={sealImage} style={styles.seal} />
          <View style={styles.signature}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>{t('Elektronik olarak onaylandı')}</Text>
            <Text style={styles.signatureSub}>VELOX Operations • {formatPdfDate(data.confirmedAt, language)}</Text>
          </View>
        </View>

        <Text style={[styles.footer, { textAlign: rtl ? 'right' : 'left' }]}>{t('VELOX işlem belgesi')} • {t('Belge numarası ile platform hesabınızdan tekrar doğrulanabilir.')}</Text>
      </Page>
    </Document>
  )
}

export async function renderInvestmentReceipt(data: ReceiptPdfData, language: PdfLanguage = 'en') {
  return renderToBuffer(<InvestmentReceiptPdf data={data} language={language} />)
}
