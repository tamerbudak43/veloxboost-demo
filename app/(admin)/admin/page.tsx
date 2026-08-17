import type { Metadata } from 'next'
import { AdminOverview } from '@/components/velox/admin/admin-overview'
import { loadAdminOverview } from '@/app/actions/admin'
import { loadDemoReports } from '@/lib/services/demo-report.service'

export const metadata: Metadata = { title: 'Yönetim · Genel Bakış · VELOX' }

export default async function AdminOverviewPage() {
  const [data, demoReports] = await Promise.all([loadAdminOverview(), loadDemoReports()])
  return <AdminOverview {...data} demoReports={demoReports} />
}
