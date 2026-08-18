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

function Row({ label, value, rtl }: { label: string; value: string; rtl: boolean }) {
  return <View style={[styles.row, rtl ? { flexDirection: 'row-reverse' } : {}]}><Text style={[styles.label, rtl ? { textAlign: 'right' } : {}]}>{label}</Text><Text style={[styles.value, rtl ? { textAlign: 'left' } : {}]}>{value}</Text></View>
}

function date(value: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'Europe/Istanbul' }).format(value)
}

function DemoGpAgreementPdf({ data, language }: { data: DemoGpAgreementData; language: string }) {
  const { t, locale, direction } = getExportLanguage(language)
  const rtl = direction === 'rtl'
  return (
    <Document title={`VELOX ${t('agreementTitle')} ${data.agreementCode}`} author="VELOX">
      <Page size="A4" style={[styles.page, rtl ? { textAlign: 'right' } : {}]}>
        <View style={styles.header}>
          <Image src={logoImage} style={styles.logo} />
          <View><Text style={styles.code}>{data.agreementCode}</Text><Text style={styles.tiny}>{t('demoReference')}</Text></View>
        </View>
        <Text style={styles.title}>{t('agreementTitle')}</Text>
        <Text style={styles.subtitle}>{t('agreementSubtitle')}</Text>

        <Text style={styles.demo}>{t('demoDisclaimer')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL PARTNER (GP)</Text>
          <Row rtl={rtl} label={t('party')} value={t('demoPlatform')} />
          <Row rtl={rtl} label={t('role')} value="General Partner (GP) - demo" />
          <Row rtl={rtl} label={t('documentNature')} value={t('interfaceSummary')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('participantRecord')}</Text>
          <Row rtl={rtl} label={t('fullName')} value={data.memberName} />
          <Row rtl={rtl} label={t('email')} value={data.memberEmail} />
          <Row rtl={rtl} label={t('userCode')} value={data.veloxId} />
          <Row rtl={rtl} label={t('issueDate')} value={date(data.issuedAt, locale)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('clauses')}</Text>
          <Text style={styles.clause}>{t('purposeClause')}</Text>
          <Text style={styles.clause}>{t('scopeClause')}</Text>
          <Text style={styles.clause}>{t('approvalClause')}</Text>
        </View>

        <View style={styles.approval}>
          <Image src={sealImage} style={styles.seal} />
          <View style={styles.signature}>
            <Text style={styles.signatureText}>VELOX Demo</Text>
            <Text style={styles.signatureLine}>{t('noLegalValidity')}</Text>
          </View>
        </View>
        <Text style={styles.footer}>{t('agreementFooter')} • {data.agreementCode}</Text>
      </Page>
    </Document>
  )
}

export async function renderDemoGpAgreement(data: DemoGpAgreementData, language = 'en') {
  return renderToBuffer(<DemoGpAgreementPdf data={data} language={language} />)
}
