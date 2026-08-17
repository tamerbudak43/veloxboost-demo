import { getNetworkData } from '@/app/actions/network'
import { MatrixNetworkDashboard } from '@/components/velox/network/matrix-network-dashboard'

export const metadata = {
  title: 'Sponsor Ağı — VELOX',
}

export default async function PartnersPage() {
  const data = await getNetworkData()
  return <MatrixNetworkDashboard {...data} />
}
