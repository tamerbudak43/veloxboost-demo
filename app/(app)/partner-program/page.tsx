import { getDirectReferralDashboardData } from '@/app/actions/network'
import { DirectReferralDashboard } from '@/components/velox/network/direct-referral-dashboard'

export const metadata = {
  title: 'Partner Programı — VELOX',
}

export default async function PartnerProgramPage() {
  const data = await getDirectReferralDashboardData()
  return <DirectReferralDashboard {...data} />
}
