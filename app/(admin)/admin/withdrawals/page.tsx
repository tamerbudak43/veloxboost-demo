import type { Metadata } from 'next'
import { AdminWithdrawals } from '@/components/velox/admin/admin-withdrawals'

export const metadata: Metadata = { title: 'Yönetim · Çekim Onayları · VELOX' }

export default function AdminWithdrawalsPage() {
  return <AdminWithdrawals />
}
