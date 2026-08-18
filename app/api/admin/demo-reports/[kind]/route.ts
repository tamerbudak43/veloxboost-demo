import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { member } from '@/lib/db/schema'
import { loadDemoReports } from '@/lib/services/demo-report.service'
import { renderDemoReportCsv } from '@/lib/services/demo-report-export'
import { renderDemoDayEndReport, renderDemoGrowthReport } from '@/lib/pdf/demo-day-end-report'
import { exportLanguageFromRequest } from '@/lib/i18n/export-language'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return new NextResponse('Oturum gerekli.', { status: 401 })
  const [profile] = await db.select({ role: member.role }).from(member).where(eq(member.userId, session.user.id)).limit(1)
  if (profile?.role !== 'admin') return new NextResponse('Yönetici yetkisi gerekli.', { status: 403 })
  const { kind } = await params
  const data = await loadDemoReports()
  const language = exportLanguageFromRequest(request)
  const format = new URL(request.url).searchParams.get('format')
  if ((kind === 'finance' || kind === 'growth') && format === 'excel') {
    const csv = renderDemoReportCsv(kind, data, language)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="VELOX_DEMO_${kind === 'growth' ? 'NETWORK_GROWTH' : 'END_OF_DAY'}_${language.toUpperCase()}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    })
  }
  const pdf = kind === 'growth' ? await renderDemoGrowthReport(data, language) : kind === 'finance' ? await renderDemoDayEndReport(data, language) : null
  if (!pdf) return new NextResponse('Rapor türü bulunamadı.', { status: 404 })
  return new NextResponse(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="VELOX_DEMO_${kind === 'growth' ? 'NETWORK_GROWTH' : 'END_OF_DAY'}_${language.toUpperCase()}.pdf"`, 'Cache-Control': 'private, no-store' } })
}
