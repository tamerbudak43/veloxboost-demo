import type { Metadata } from 'next'
import { AdminCommissions, type AdminCommission } from '@/components/velox/admin/admin-commissions'
import { loadCommissionAdmin, loadCareerAdmin } from '@/app/actions/admin'

export const metadata: Metadata = { title: 'Yönetim · Komisyon Seviyeleri · VELOX' }

export default async function AdminCommissionsPage() {
  const [levels, careers] = await Promise.all([loadCommissionAdmin(), loadCareerAdmin()])
  const careerCodes = careers.map((c) => c.code)
  return <AdminCommissions levels={levels as unknown as AdminCommission[]} careerCodes={careerCodes} />
}
