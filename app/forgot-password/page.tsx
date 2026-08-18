import { PasswordRecoveryForm } from '@/components/velox/auth/password-recovery-form'

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <PasswordRecoveryForm mode="request" />
    </main>
  )
}
