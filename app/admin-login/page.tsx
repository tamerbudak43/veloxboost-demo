import { AdminLoginForm } from '@/components/velox/admin/admin-login-form'

export const metadata = {
  title: 'VELOX Admin Girişi',
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>
}) {
  const { denied } = await searchParams
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <AdminLoginForm denied={denied === '1'} />
    </main>
  )
}
