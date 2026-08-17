import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { AppShell } from '@/components/velox/app-shell'
import { createMemberProfile, ensureInitialAdmin, getMyProfile } from '@/app/actions/member'

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  // Safety net: ensure a member profile exists for this user (e.g. accounts
  // created before the profile step). No sponsor → placed as a root.
  const profile = await getMyProfile()
  if (!profile) {
    await createMemberProfile({
      name: session.user.name ?? 'Üye',
      email: session.user.email ?? '',
    })
  } else {
    // Local/bootstrap-only promotion for the configured initial administrator.
    await ensureInitialAdmin()
  }

  return <AppShell>{children}</AppShell>
}
