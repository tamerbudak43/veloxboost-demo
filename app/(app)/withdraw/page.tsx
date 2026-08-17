import { WalletView } from '@/components/velox/wallet/wallet-view'

export const metadata = {
  title: 'Bakiye Çek — VELOX',
}

export default function WithdrawPage() {
  return <WalletView initialTab="withdraw" />
}
