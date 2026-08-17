import type { Metadata } from 'next'
import { AdminPools } from '@/components/velox/admin/admin-pools'

export const metadata: Metadata = { title: 'Yönetim · Havuz & Faz · VELOX' }

export default function AdminPoolsPage() {
  return <AdminPools />
}
