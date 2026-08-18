import { getMyKycProfile } from '@/app/actions/kyc'
import { getMyProfile } from '@/app/actions/member'
import { KycProfileForm } from '@/components/velox/kyc/kyc-profile-form'

export const metadata = { title: 'KYC Profili — VELOX' }

export default async function KycPage() {
  const [kyc, profile] = await Promise.all([getMyKycProfile(), getMyProfile()])
  return <KycProfileForm initial={{
    email: profile?.email ?? '', fullName: kyc?.fullName ?? profile?.name ?? '', birthDate: kyc?.birthDate ?? '', nationality: kyc?.nationality ?? '', country: kyc?.country ?? '', city: kyc?.city ?? '', addressLine: kyc?.addressLine ?? '', postalCode: kyc?.postalCode ?? '', phone: kyc?.phone ?? '', documentType: kyc?.documentType ?? 'national_id', documentNumber: kyc?.documentNumber ?? '', documentExpiry: kyc?.documentExpiry ?? '', walletNetwork: kyc?.walletNetwork ?? 'BEP20', walletAddress: kyc?.walletAddress ?? '', consentAccepted: kyc?.consentAccepted ?? false, status: kyc?.status ?? 'draft',
  }} />
}
