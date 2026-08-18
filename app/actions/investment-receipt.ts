'use server'

import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { investmentReceipt, member } from '@/lib/db/schema'
import type { InvestmentReceipt, InvestmentReceiptStatus } from '@/lib/types'
import { getWalletNetwork } from '@/lib/wallet/network-config'

function typedReceipt<T extends { status: string }>(record: T) {
  return { ...record, status: record.status as InvestmentReceiptStatus }
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
export async function createInvestmentInstruction(rawAmount: number, rawNetwork: string): Promise<InvestmentReceipt> {
  const network = getWalletNetwork(rawNetwork)
  if (!network) throw new Error('Desteklenmeyen cüzdan ağı seçildi.')
  if (!network.depositAddress || (network.memoRequired && !network.depositMemo)) {
    throw new Error(`${network.label} yatırım bilgileri henüz yönetici tarafından yapılandırılmadı.`)
  }
  const amount = Number(rawAmount)
  if (!Number.isFinite(amount) || amount < network.minimumDeposit) {
    throw new Error(`Minimum yatırım tutarı ${network.minimumDeposit} USDT olmalıdır.`)
  }

  const userId = await currentUserId()
  const [record] = await db
    .insert(investmentReceipt)
    .values({
      userId,
      receiptNumber: createReceiptNumber(),
      amount: amount.toFixed(4),
      network: network.id,
      receivingAddress: network.depositAddress,
      depositMemo: network.depositMemo,
      status: 'pending',
    })
    .returning()

  return typedReceipt(record)
}

export async function getMyInvestmentReceipts(): Promise<InvestmentReceipt[]> {
  const userId = await currentUserId()
  const records = await db
    .select()
    .from(investmentReceipt)
    .where(eq(investmentReceipt.userId, userId))
    .orderBy(desc(investmentReceipt.issuedAt))
  return records.map(typedReceipt)
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

  const records = await db
    .select({
      id: investmentReceipt.id,
      receiptNumber: investmentReceipt.receiptNumber,
      amount: investmentReceipt.amount,
      asset: investmentReceipt.asset,
      network: investmentReceipt.network,
      receivingAddress: investmentReceipt.receivingAddress,
      depositMemo: investmentReceipt.depositMemo,
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
  return records.map(typedReceipt)
}

/** Admin-only confirmation. The blockchain transaction hash is required so
 * a pending instruction cannot be presented as an actual completed deposit. */
export type ReceiptConfirmationResult =
  | { ok: true; receipt: InvestmentReceipt }
  | { ok: false; error: string }

/**
 * Admin-only confirmation. Expected validation failures are returned as data
 * instead of being thrown: production Server Actions intentionally mask thrown
 * errors, which otherwise appears in the UI as React error #441.
 */
export async function confirmInvestmentReceipt(
  receiptId: number,
  transactionHash: string,
): Promise<ReceiptConfirmationResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false, error: 'Oturum bulunamadı. Lütfen yeniden giriş yapın.' }

  const [operator] = await db.select().from(member).where(eq(member.userId, session.user.id)).limit(1)
  if (operator?.role !== 'admin') {
    return { ok: false, error: 'Bu işlem için yönetici yetkisi gerekir.' }
  }

  // Supported chains use either hexadecimal or Base64/Base64URL transaction
  // identifiers. Final chain verification remains an explicit admin step.
  const hash = transactionHash.trim()
  if (!/^[A-Za-z0-9+/=_:-]{32,128}$/.test(hash)) {
    return { ok: false, error: 'Seçilen ağa ait geçerli işlem hash değerini girin.' }
  }

  const [updated] = await db
    .update(investmentReceipt)
    .set({ status: 'confirmed', transactionHash: hash, confirmedAt: new Date() })
    .where(and(eq(investmentReceipt.id, receiptId), eq(investmentReceipt.status, 'pending')))
    .returning()

  if (!updated) return { ok: false, error: 'Bekleyen yatırım talimatı bulunamadı veya daha önce işleme alındı.' }
  return { ok: true, receipt: typedReceipt(updated) }
}
