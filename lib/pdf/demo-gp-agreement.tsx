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

export type DemoGpAgreementData = {
  memberName: string
  memberEmail: string
  veloxId: string
  agreementCode: string
  issuedAt: Date
}

const styles = StyleSheet.create({
  page: { padding: 42, fontFamily: 'VeloxDocument', color: '#10243a', fontSize: 9 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logo: { width: 72, height: 48, objectFit: 'contain' },
  code: { color: '#007fa5', fontFamily: 'VeloxDocument', fontWeight: 700, textAlign: 'right' },
  tiny: { marginTop: 3, color: '#526579', fontSize: 7.5, textAlign: 'right' },
  title: { marginTop: 16, fontSize: 18, fontFamily: 'VeloxDocument', fontWeight: 700, textAlign: 'center' },
  subtitle: { marginTop: 5, color: '#007fa5', fontSize: 9, textAlign: 'center' },
  demo: { marginTop: 12, borderWidth: 1, borderColor: '#e4a11b', backgroundColor: '#fff8e8', borderRadius: 4, padding: 9, color: '#6c4910', lineHeight: 1.45 },
  section: { marginTop: 12, borderWidth: 1, borderColor: '#cbd9e3', borderRadius: 4, padding: 12 },
  sectionTitle: { color: '#007fa5', fontFamily: 'VeloxDocument', fontWeight: 700, marginBottom: 6 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d9e3ea', paddingVertical: 6 },
  label: { width: '39%', color: '#526579' },
  value: { width: '61%', fontFamily: 'VeloxDocument', fontWeight: 700, textAlign: 'right' },
  clause: { marginTop: 8, lineHeight: 1.45, color: '#385166' },
  approval: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  seal: { width: 58, height: 58, opacity: 0.48 },
  signature: { width: 200, alignItems: 'flex-end' },
  signatureText: { fontSize: 14, fontFamily: 'Times-Roman', fontStyle: 'italic', color: '#10243a' },
  signatureLine: { width: '100%', borderTopWidth: 1, borderTopColor: '#526579', marginTop: 3, paddingTop: 5, textAlign: 'center', color: '#526579', fontSize: 7.5 },
  footer: { position: 'absolute', left: 42, right: 42, bottom: 28, borderTopWidth: 1, borderTopColor: '#d9e3ea', paddingTop: 7, fontSize: 7.2, color: '#526579', textAlign: 'center' },
})

const asset = (name: string) => `${process.cwd()}/public/assets/${name}`
const logoImage = `data:image/png;base64,${readFileSync(asset('velox-logo-header-print.png')).toString('base64')}`
const sealImage = `data:image/png;base64,${readFileSync(asset('velox-singapore-seal.png')).toString('base64')}`

Font.register({
  family: 'VeloxDocument',
  fonts: [
    { src: asset('velox-document-regular.ttf'), fontWeight: 400 },
    { src: asset('velox-document-bold.ttf'), fontWeight: 700 },
  ],
})

function Row({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
}

function date(value: Date) {
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long', timeZone: 'Europe/Istanbul' }).format(value)
}

function DemoGpAgreementPdf({ data }: { data: DemoGpAgreementData }) {
  return (
    <Document title={`VELOX GP Demo Özeti ${data.agreementCode}`} author="VELOX">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoImage} style={styles.logo} />
          <View><Text style={styles.code}>{data.agreementCode}</Text><Text style={styles.tiny}>DEMO REFERANS NO.</Text></View>
        </View>
        <Text style={styles.title}>GENERAL PARTNER (GP) DEMO ÖZETİ</Text>
        <Text style={styles.subtitle}>Platform arayüzü ve belge çıktısı örneği</Text>

        <Text style={styles.demo}>Bu PDF yalnızca VELOX demo arayüzünün belge görünümünü göstermek için üretilmiştir. Bağlayıcı sözleşme, yatırım çağrısı, varlık devri, getiri taahhüdü veya geçerli elektronik imza içermez.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL PARTNER (GP)</Text>
          <Row label="Taraf" value="VELOX Demo Platformu" />
          <Row label="Rol" value="General Partner (GP) - demo" />
          <Row label="Belge niteliği" value="Arayüz ve eğitim özeti" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KATILIMCI KAYDI</Text>
          <Row label="Ad soyad" value={data.memberName} />
          <Row label="E-posta" value={data.memberEmail} />
          <Row label="VELOX kullanıcı kodu" value={data.veloxId} />
          <Row label="Oluşturulma tarihi" value={date(data.issuedAt)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEMO MADDELER</Text>
          <Text style={styles.clause}>1. Amaç: Bu belge, GP odaklı sözleşme ekranı ile kişiye özel PDF çıktısının tasarımsal işleyişini gösterir.</Text>
          <Text style={styles.clause}>2. Kapsam: Demo ortamında gerçek para, cüzdan, alım-satım, fon toplama veya varlık aktarımı gerçekleştirilmez.</Text>
          <Text style={styles.clause}>3. Onay: Aşağıdaki kaşe ve elektronik onay alanı yalnızca arayüz örneğidir; nitelikli elektronik sertifikaya dayalı imza değildir.</Text>
        </View>

        <View style={styles.approval}>
          <Image src={sealImage} style={styles.seal} />
          <View style={styles.signature}>
            <Text style={styles.signatureText}>VELOX Demo</Text>
            <Text style={styles.signatureLine}>ELEKTRONİK DEMO ONAYI - HUKUKİ GEÇERLİLİĞİ YOKTUR</Text>
          </View>
        </View>
        <Text style={styles.footer}>VELOX GP demo özeti - {data.agreementCode} - Bu belge resmî sözleşme veya imzalı hukukî evrak değildir.</Text>
      </Page>
    </Document>
  )
}

export async function renderDemoGpAgreement(data: DemoGpAgreementData) {
  return renderToBuffer(<DemoGpAgreementPdf data={data} />)
}
