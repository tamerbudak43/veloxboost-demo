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

function date(value: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(value)
}

function Row({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
}

function InvestmentReceiptPdf({ data }: { data: ReceiptPdfData }) {
  return (
    <Document title={`VELOX yatırım işlem belgesi ${data.receiptNumber}`} author="VELOX">
      <Page size="A4" style={styles.page}>
        <Image src={logoImage} style={styles.headerLogo} />
        <Text style={styles.title}>YATIRIM İŞLEM BELGESİ</Text>
        <Text style={styles.subtitle}>Doğrulanmış dijital varlık yatırımı işlem özeti</Text>
        <View style={styles.rule} />

        <Row label="Belge numarası" value={data.receiptNumber} />
        <Row label="Belge oluşturma tarihi" value={date(data.issuedAt)} />
        <Row label="Ağ doğrulama tarihi" value={date(data.confirmedAt)} />
        <Row label="İşlem durumu" value={data.status === 'confirmed' ? 'Doğrulandı' : data.status} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ÜYE BİLGİLERİ</Text>
          <Row label="Ad soyad" value={data.memberName} />
          <Row label="E-posta" value={data.memberEmail} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YATIRIM BİLGİLERİ</Text>
          <Row label="Yatırım tutarı" value={`${data.amount} ${data.asset}`} />
          <Row label="Ağ" value={data.network} />
          <Row label="Alıcı adresi" value={data.receivingAddress} />
          <Row label="İşlem hash" value={data.transactionHash ?? '—'} />
        </View>

        <Text style={styles.note}>
          Bu belge VELOX platformundaki doğrulanmış yatırım işleminin özetidir. Resmî vergi faturası, kâr taahhüdü veya yatırım tavsiyesi değildir. İşlem hash değeri, ilgili blok zinciri kaydından bağımsız olarak doğrulanabilir.
        </Text>

        <View style={styles.approval}>
          <Image src={sealImage} style={styles.seal} />
          <View style={styles.signature}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>Elektronik olarak onaylandı</Text>
            <Text style={styles.signatureSub}>VELOX Operations • {date(data.confirmedAt)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>VELOX işlem belgesi • Belge numarası ile platform hesabınızdan tekrar doğrulanabilir.</Text>
      </Page>
    </Document>
  )
}

export async function renderInvestmentReceipt(data: ReceiptPdfData) {
  return renderToBuffer(<InvestmentReceiptPdf data={data} />)
}
