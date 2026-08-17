import type { Metadata } from 'next'
import { AdminCareers, type AdminCareer } from '@/components/velox/admin/admin-careers'
import { loadCareerAdmin } from '@/app/actions/admin'

export const metadata: Metadata = { title: 'Yönetim · Kariyer Yönetimi · VELOX' }

export default async function AdminCareersPage() {
  const careers = (await loadCareerAdmin()) as unknown as AdminCareer[]
  return <AdminCareers careers={careers} />
}
