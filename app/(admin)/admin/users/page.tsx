import type { Metadata } from 'next'
import { AdminUsers } from '@/components/velox/admin/admin-users'
import { loadAdminUsers } from '@/app/actions/admin'

export const metadata: Metadata = { title: 'Yönetim · Kullanıcılar · VELOX' }

export default async function AdminUsersPage() {
  const users = await loadAdminUsers()
  return <AdminUsers users={users} />
}
