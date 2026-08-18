import { WalletView } from '@/components/velox/wallet/wallet-view'
import { getWalletNetworks } from '@/lib/wallet/network-config'

export const metadata = {
  title: 'Otomatik Çekim — VELOX',
}

export default function AutoWithdrawPage() {
  return <WalletView initialTab="auto" walletNetworks={getWalletNetworks()} />
}
