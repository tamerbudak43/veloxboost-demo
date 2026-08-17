import type { Metadata } from 'next'
import { AdminCareers, type AdminCareer } from '@/components/velox/admin/admin-careers'
import { loadCareerAdmin, loadCashbackAdmin } from '@/app/actions/admin'

export const metadata: Metadata = { title: 'Yönetim · Kariyer Yönetimi · VELOX' }

export default async function AdminCareersPage() {
  const [careers, cashbackTiers] = await Promise.all([loadCareerAdmin(), loadCashbackAdmin()])
  return <AdminCareers careers={careers as unknown as AdminCareer[]} cashbackTiers={cashbackTiers} />
}
