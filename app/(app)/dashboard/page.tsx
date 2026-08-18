import { getUserDashboardData } from '@/app/actions/network'
import { UserDashboard } from '@/components/velox/dashboard/user-dashboard'

export const metadata = { title: 'Ana Panel — VELOX' }

export default async function DashboardPage() {
  const data = await getUserDashboardData()
  return <UserDashboard data={data} />
}
