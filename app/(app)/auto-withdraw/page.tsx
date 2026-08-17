import { WalletView } from '@/components/velox/wallet/wallet-view'

export const metadata = {
  title: 'Otomatik Çekim — VELOX',
}

export default function AutoWithdrawPage() {
  return <WalletView initialTab="auto" />
}
