import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { member } from '@/lib/db/schema'

/**
 * Resolves the current session's member row (or null when signed out).
 */
export async function getSessionMember() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const rows = await db.select().from(member).where(eq(member.userId, session.user.id)).limit(1)
  return rows[0] ?? null
}

/**
 * Guards an admin route. Redirects to the admin login when the visitor is not
 * signed in, or to the investor panel when signed in without the admin role.
 * Returns the admin member row on success.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/admin-login')

  const rows = await db.select().from(member).where(eq(member.userId, session.user.id)).limit(1)
  const me = rows[0]
  if (!me || me.role !== 'admin') redirect('/admin-login?denied=1')
  return me
}
