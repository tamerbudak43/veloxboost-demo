import { WalletView } from '@/components/velox/wallet/wallet-view'
import { getMyInvestmentReceipts } from '@/app/actions/investment-receipt'
import { getWalletNetworks } from '@/lib/wallet/network-config'

export const metadata = {
  title: 'Bakiye Yatır — VELOX',
}

export default async function DepositPage() {
  const receipts = await getMyInvestmentReceipts()
  return (
    <WalletView
      initialTab="deposit"
      initialReceipts={receipts}
      walletNetworks={getWalletNetworks()}
    />
  )
}
