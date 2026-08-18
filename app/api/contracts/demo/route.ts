import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { member } from '@/lib/db/schema'
import { renderDemoGpAgreement } from '@/lib/pdf/demo-gp-agreement'
import { exportLanguageFromRequest } from '@/lib/i18n/export-language'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return new NextResponse('Oturum gerekli.', { status: 401 })

  const [profile] = await db.select().from(member).where(eq(member.userId, session.user.id)).limit(1)
  const issuedAt = new Date()
  const agreementCode = `VLX-GP-DEMO-${profile?.veloxId ?? session.user.id.slice(-6)}`
  const language = exportLanguageFromRequest(request)
  const pdf = await renderDemoGpAgreement({
    memberName: profile?.name ?? session.user.name ?? 'Üye',
    memberEmail: profile?.email ?? session.user.email ?? '—',
    veloxId: profile?.veloxId ?? '—',
    agreementCode,
    issuedAt,
  }, language)

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${agreementCode}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
