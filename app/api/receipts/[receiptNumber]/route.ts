import { and, eq } from 'drizzle-orm'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { investmentReceipt, member } from '@/lib/db/schema'
import { renderInvestmentReceipt } from '@/lib/pdf/investment-receipt'
import { resolvePdfLanguage } from '@/lib/pdf/pdf-i18n'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ receiptNumber: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return new NextResponse('Oturum gerekli.', { status: 401 })

  const { receiptNumber } = await params
  const [record] = await db
    .select({
      receiptNumber: investmentReceipt.receiptNumber,
      amount: investmentReceipt.amount,
      asset: investmentReceipt.asset,
      network: investmentReceipt.network,
      receivingAddress: investmentReceipt.receivingAddress,
      transactionHash: investmentReceipt.transactionHash,
      status: investmentReceipt.status,
      issuedAt: investmentReceipt.issuedAt,
      confirmedAt: investmentReceipt.confirmedAt,
      memberName: member.name,
      memberEmail: member.email,
    })
    .from(investmentReceipt)
    .innerJoin(member, eq(member.userId, investmentReceipt.userId))
    .where(and(eq(investmentReceipt.receiptNumber, receiptNumber), eq(investmentReceipt.userId, session.user.id)))
    .limit(1)

  if (!record) return new NextResponse('Belge bulunamadı.', { status: 404 })
  if (record.status !== 'confirmed') return new NextResponse('Belge, ağ doğrulamasından sonra indirilebilir.', { status: 409 })
  const language = resolvePdfLanguage((await cookies()).get('velox-language')?.value)

  const pdf = await renderInvestmentReceipt({
    ...record,
    issuedAt: record.issuedAt,
    confirmedAt: record.confirmedAt,
  }, language)

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${record.receiptNumber}-${language}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
