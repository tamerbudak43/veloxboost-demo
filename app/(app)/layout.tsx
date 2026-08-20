import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { AppShell } from '@/components/velox/app-shell'
import { ensureInitialAdmin, getMyProfile } from '@/app/actions/member'

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  // getMyProfile() provisions a member row itself when one doesn't exist yet.
  await getMyProfile()
  // Local/bootstrap-only promotion for the configured initial administrator.
  await ensureInitialAdmin()

  return <AppShell>{children}</AppShell>
}
