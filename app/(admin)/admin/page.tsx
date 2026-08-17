import type { Metadata } from 'next'
import { AdminOverview } from '@/components/velox/admin/admin-overview'
import { loadAdminOverview } from '@/app/actions/admin'

export const metadata: Metadata = { title: 'Yönetim · Genel Bakış · VELOX' }

export default async function AdminOverviewPage() {
  const data = await loadAdminOverview()
  return <AdminOverview {...data} />
}
