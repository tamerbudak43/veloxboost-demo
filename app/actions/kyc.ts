'use server'

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { kycProfile } from '@/lib/db/schema'

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum bulunamadı.')
  return session.user.id
}

export async function getMyKycProfile() {
  const userId = await currentUserId()
  const [row] = await db.select().from(kycProfile).where(eq(kycProfile.userId, userId)).limit(1)
  return row ?? null
}

export type KycProfileInput = {
  fullName: string
  birthDate: string
  nationality: string
  country: string
  city: string
  addressLine: string
  postalCode?: string
  phone: string
  documentType: string
  documentNumber: string
  documentExpiry?: string
  walletNetwork: string
  walletAddress: string
  consentAccepted: boolean
}

function clean(value: string | undefined, max = 180) {
  return (value ?? '').trim().slice(0, max)
}

export async function saveMyKycProfile(input: KycProfileInput, submit = false) {
  const userId = await currentUserId()
  const data = {
    fullName: clean(input.fullName, 120),
    birthDate: clean(input.birthDate, 10),
    nationality: clean(input.nationality, 80),
    country: clean(input.country, 80),
    city: clean(input.city, 80),
    addressLine: clean(input.addressLine, 240),
    postalCode: clean(input.postalCode, 20) || null,
    phone: clean(input.phone, 32),
    documentType: clean(input.documentType, 30) || 'national_id',
    documentNumber: clean(input.documentNumber, 60),
    documentExpiry: clean(input.documentExpiry, 10) || null,
    walletAsset: 'USDT',
    walletNetwork: clean(input.walletNetwork, 20) || 'BEP20',
    walletAddress: clean(input.walletAddress, 160),
    consentAccepted: Boolean(input.consentAccepted),
    status: submit ? 'pending' : 'draft',
    submittedAt: submit ? new Date() : null,
    updatedAt: new Date(),
  }

  if (submit) {
    const missing = [data.fullName, data.birthDate, data.nationality, data.country, data.city, data.addressLine, data.phone, data.documentNumber, data.walletAddress].some((value) => !value)
    if (missing) throw new Error('Zorunlu KYC alanlarını eksiksiz doldurun.')
    if (!data.consentAccepted) throw new Error('KYC veri işleme onayı gereklidir.')
  }

  const [existing] = await db.select({ id: kycProfile.id }).from(kycProfile).where(eq(kycProfile.userId, userId)).limit(1)
  if (existing) {
    await db.update(kycProfile).set(data).where(eq(kycProfile.userId, userId))
  } else {
    await db.insert(kycProfile).values({ userId, ...data })
  }
  return { ok: true, status: data.status }
}
