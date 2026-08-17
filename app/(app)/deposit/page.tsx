import { WalletView } from '@/components/velox/wallet/wallet-view'
import { getMyInvestmentReceipts } from '@/app/actions/investment-receipt'

export const metadata = {
  title: 'Bakiye Yatır — VELOX',
}

export default async function DepositPage() {
  const receipts = await getMyInvestmentReceipts()
  return (
    <WalletView
      initialTab="deposit"
      initialReceipts={receipts}
      depositAddress={process.env.VELOX_USDT_TRC20_ADDRESS ?? null}
    />
  )
}
