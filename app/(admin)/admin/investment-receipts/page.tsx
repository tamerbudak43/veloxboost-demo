import type { Metadata } from 'next'
import { getPendingInvestmentReceipts } from '@/app/actions/investment-receipt'
import { AdminInvestmentReceipts } from '@/components/velox/admin/admin-investment-receipts'

export const metadata: Metadata = { title: 'Yönetim · Yatırım Belgeleri · VELOX' }

export default async function InvestmentReceiptsPage() {
  const receipts = await getPendingInvestmentReceipts()
  return <AdminInvestmentReceipts initialReceipts={receipts} />
}
