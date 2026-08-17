import { getMyProfile } from '@/app/actions/member'
import { MyContractsView } from '@/components/velox/contracts/my-contracts-view'

export const metadata = { title: 'Sözleşmelerim — VELOX' }

export default async function MyContractsPage() {
  const profile = await getMyProfile()
  return <MyContractsView memberName={profile?.name ?? 'Üye'} memberEmail={profile?.email ?? '—'} veloxId={profile?.veloxId ?? '—'} />
}
