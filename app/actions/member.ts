'use server'

import { eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { member, networkClosure } from '@/lib/db/schema'

const MAX_DEPTH = 33

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

/** VLX + 6 base36 chars derived from a random seed. */
function makeCode(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}${rand}`
}

async function generateUniqueVeloxId(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const id = `VLX-${100000 + Math.floor(Math.random() * 899999)}`
    const [existing] = await db.select().from(member).where(eq(member.veloxId, id)).limit(1)
    if (!existing) return id
  }
  return `VLX-${Date.now().toString().slice(-6)}`
}

async function generateUniqueReferralCode(name: string): Promise<string> {
  const base = (name.replace(/[^a-zA-Z]/g, '').slice(0, 3) || 'VLX').toUpperCase()
  for (let i = 0; i < 8; i++) {
    const code = makeCode(base)
    const [existing] = await db
      .select()
      .from(member)
      .where(eq(member.referralCode, code))
      .limit(1)
    if (!existing) return code
  }
  return makeCode('VLX')
}

/**
 * Writes closure rows connecting the new member to every ancestor of its
 * sponsor (up to 33 levels), plus the direct sponsor→member link at depth 1.
 * This is the sponsor-based network engine — no binary/forced placement.
 */
async function writeClosure(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  sponsorUserId: string,
  newUserId: string,
) {
  // Ancestors of the sponsor (ancestor → sponsor at depth d).
  const ancestors = await tx
    .select({ ancestorUserId: networkClosure.ancestorUserId, depth: networkClosure.depth })
    .from(networkClosure)
    .where(eq(networkClosure.descendantUserId, sponsorUserId))

  const rows: { ancestorUserId: string; descendantUserId: string; depth: number }[] = [
    { ancestorUserId: sponsorUserId, descendantUserId: newUserId, depth: 1 },
  ]
  for (const a of ancestors) {
    const depth = a.depth + 1
    if (depth <= MAX_DEPTH) {
      rows.push({ ancestorUserId: a.ancestorUserId, descendantUserId: newUserId, depth })
    }
  }
  if (rows.length > 0) await tx.insert(networkClosure).values(rows)
}

/**
 * Creates the VELOX network profile for the just-registered auth user.
 * `referralCode` is the sponsor's code entered at registration (optional).
 */
export async function createMemberProfile(input: {
  name: string
  email: string
  referralCode?: string
}) {
  const userId = await getUserId()

  const [already] = await db.select().from(member).where(eq(member.userId, userId)).limit(1)
  if (already) return { ok: true, veloxId: already.veloxId, referralCode: already.referralCode }

  let sponsor: typeof member.$inferSelect | undefined
  const code = input.referralCode?.trim()
  if (code) {
    const [found] = await db.select().from(member).where(eq(member.referralCode, code)).limit(1)
    sponsor = found
  }

  if (code && !sponsor) {
    throw new Error('Geçersiz referans kodu ile üyelik oluşturulamaz.')
  }

  const veloxId = await generateUniqueVeloxId()
  const referralCode = await generateUniqueReferralCode(input.name)
  const normalizedEmail = input.email.trim().toLowerCase()
  const bootstrapEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase()
  const isInitialAdmin = Boolean(bootstrapEmail && normalizedEmail === bootstrapEmail)

  await db.transaction(async (tx) => {
    await tx.insert(member).values({
      userId,
      name: input.name.trim(),
      email: normalizedEmail,
      veloxId,
      referralCode,
      sponsorId: sponsor?.userId ?? null,
      // Only the explicitly configured local bootstrap email can receive the
      // initial admin role. No client input can set a role.
      role: isInitialAdmin ? 'admin' : 'member',
      status: 'active',
      career: 'STARTER',
    })

    if (sponsor) {
      await writeClosure(tx, sponsor.userId, userId)
      // Atomic increment prevents two simultaneous registrations from losing a count.
      await tx
        .update(member)
        .set({ directCount: sql`${member.directCount} + 1` })
        .where(eq(member.userId, sponsor.userId))
    }
  })

  return { ok: true, veloxId, referralCode }
}

/**
 * Promotes an already-created local bootstrap account exactly when its email
 * matches INITIAL_ADMIN_EMAIL. This supports projects created before the
 * bootstrap setting was added, without exposing a public promotion endpoint.
 */
export async function ensureInitialAdmin() {
  const userId = await getUserId()
  const bootstrapEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase()
  if (!bootstrapEmail) return false

  const [profile] = await db.select().from(member).where(eq(member.userId, userId)).limit(1)
  if (!profile || profile.email.trim().toLowerCase() !== bootstrapEmail || profile.role === 'admin') {
    return false
  }

  await db.update(member).set({ role: 'admin' }).where(eq(member.userId, userId))
  return true
}

/** Returns the current user's member profile (or null if not created yet). */
export async function getMyProfile() {
  const userId = await getUserId()
  const [row] = await db.select().from(member).where(eq(member.userId, userId)).limit(1)
  return row ?? null
}

/** Validates a referral code exists. Used by the sign-up form. */
export async function validateReferralCode(code: string) {
  const trimmed = code.trim()
  if (!trimmed) return { valid: false }
  const [row] = await db
    .select({ name: member.name, veloxId: member.veloxId })
    .from(member)
    .where(eq(member.referralCode, trimmed))
    .limit(1)
  return row
    ? { valid: true, sponsorName: row.name, sponsorVeloxId: row.veloxId }
    : { valid: false }
}
