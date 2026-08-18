import { WalletView } from '@/components/velox/wallet/wallet-view'
import { getWalletNetworks } from '@/lib/wallet/network-config'

export const metadata = {
  title: 'Bakiye Çek — VELOX',
}

export default function WithdrawPage() {
  return <WalletView initialTab="withdraw" walletNetworks={getWalletNetworks()} />
}
