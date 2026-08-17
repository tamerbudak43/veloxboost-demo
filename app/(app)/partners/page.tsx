import { NetworkExplorer } from '@/components/velox/network/network-explorer'
import { getNetworkData } from '@/app/actions/network'

export const metadata = {
  title: 'Sponsor Ağı — VELOX',
}

export default async function PartnersPage() {
  const data = await getNetworkData()
  return <NetworkExplorer {...data} />
}
