import { PasswordRecoveryForm } from '@/components/velox/auth/password-recovery-form'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token = '', error } = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <PasswordRecoveryForm mode="reset" token={token} invalidToken={error === 'INVALID_TOKEN'} />
    </main>
  )
}
