import { AdminShell } from '@/components/velox/admin/admin-shell'
import { requireAdmin } from '@/lib/admin-auth'

export const metadata = {
  title: 'VELOX Admin',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  return <AdminShell adminName={admin.name}>{children}</AdminShell>
}
