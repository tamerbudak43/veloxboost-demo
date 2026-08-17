import type { Metadata } from 'next'
import { AdminNetwork } from '@/components/velox/admin/admin-network'
import { searchMembers } from '@/app/actions/admin'

export const metadata: Metadata = { title: 'Yönetim · Ağ Arama · VELOX' }

export default async function AdminNetworkPage() {
  const members = await searchMembers('')
  return <AdminNetwork initialMembers={members} />
}
