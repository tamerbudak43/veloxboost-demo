import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-auth'
import { loadDemoReports } from '@/lib/services/demo-report.service'
import { AdminDemoReports } from '@/components/velox/admin/admin-demo-reports'
export const metadata: Metadata = { title: 'Yönetim · Demo Raporları · VELOX' }
export default async function AdminReportsPage() { await requireAdmin(); const data = await loadDemoReports(); return <AdminDemoReports daily={data.daily} endingCash={data.endingCash} /> }
