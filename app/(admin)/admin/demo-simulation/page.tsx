import type { Metadata } from 'next'
import { loadPhaseOneDemoSimulation } from '@/app/actions/admin'
import { AdminDemoSimulation } from '@/components/velox/admin/admin-demo-simulation'

export const metadata: Metadata = { title: 'Yönetim · Faz 1 Demo Simülasyonu · VELOX' }

export default async function AdminDemoSimulationPage() {
  const data = await loadPhaseOneDemoSimulation()
  return <AdminDemoSimulation {...data} />
}
