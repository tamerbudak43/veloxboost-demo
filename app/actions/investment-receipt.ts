'use server'

import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { investmentReceipt, member } from '@/lib/db/schema'
import type { InvestmentReceipt } from '@/lib/types'

function getReceivingAddress() {
  const address = process.env.VELOX_USDT_TRC20_ADDRESS?.trim()
  if (!address) throw new Error('USDT-TRC20 yatırım adresi henüz yapılandırılmadı.')
  return address
}

function createReceiptNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const serial = crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()
  return `VLX-${date}-${serial}`
}

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum bulunamadı.')
  return session.user.id
}

/**
 * Creates a pending instruction, not a completed payment receipt. A document
 * becomes downloadable only after the deposit is verified on-chain/admin side.
 */
export async function createInvestmentInstruction(rawAmount: number) {
  const amount = Number(rawAmount)
  if (!Number.isFinite(amount) || amount < 50) {
    throw new Error('Minimum yatırım tutarı 50 USDT olmalıdır.')
  }

  const userId = await currentUserId()
  const [record] = await db
    .insert(investmentReceipt)
    .values({
      userId,
      receiptNumber: createReceiptNumber(),
      amount: amount.toFixed(4),
      receivingAddress: getReceivingAddress(),
      status: 'pending',
    })
    .returning()

  return record
}

export async function getMyInvestmentReceipts(): Promise<InvestmentReceipt[]> {
  const userId = await currentUserId()
  return db
    .select()
    .from(investmentReceipt)
    .where(eq(investmentReceipt.userId, userId))
    .orderBy(desc(investmentReceipt.issuedAt))
}

export type AdminInvestmentReceipt = InvestmentReceipt & {
  memberName: string
  memberEmail: string
}

export async function getPendingInvestmentReceipts(): Promise<AdminInvestmentReceipt[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum bulunamadı.')

  const [operator] = await db.select().from(member).where(eq(member.userId, session.user.id)).limit(1)
  if (operator?.role !== 'admin') throw new Error('Bu işlem için yönetici yetkisi gerekir.')

  return db
    .select({
      id: investmentReceipt.id,
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
    .where(eq(investmentReceipt.status, 'pending'))
    .orderBy(desc(investmentReceipt.issuedAt))
}

/** Admin-only confirmation. The blockchain transaction hash is required so
 * a pending instruction cannot be presented as an actual completed deposit. */
export async function confirmInvestmentReceipt(receiptId: number, transactionHash: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum bulunamadı.')

  const [operator] = await db.select().from(member).where(eq(member.userId, session.user.id)).limit(1)
  if (operator?.role !== 'admin') throw new Error('Bu işlem için yönetici yetkisi gerekir.')
  const hash = transactionHash.trim()
  if (!/^[a-fA-F0-9]{64}$/.test(hash)) {
    throw new Error('Geçerli 64 karakterlik blok zinciri işlem hash değeri girin.')
  }

  const [updated] = await db
    .update(investmentReceipt)
    .set({ status: 'confirmed', transactionHash: hash, confirmedAt: new Date() })
    .where(and(eq(investmentReceipt.id, receiptId), eq(investmentReceipt.status, 'pending')))
    .returning()

  if (!updated) throw new Error('Bekleyen yatırım talimatı bulunamadı.')
  return updated
}
