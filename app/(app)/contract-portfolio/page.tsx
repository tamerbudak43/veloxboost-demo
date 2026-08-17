import { getMyProfile } from '@/app/actions/member'
import { ContractPortfolioView } from '@/components/velox/contracts/contract-portfolio-view'

export const metadata = { title: 'Sözleşmelerim — VELOX' }

export default async function ContractPortfolioPage() {
  const profile = await getMyProfile()
  return <ContractPortfolioView memberName={profile?.name ?? 'Üye'} veloxId={profile?.veloxId ?? '—'} />
}
