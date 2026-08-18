'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Loader2, Mail } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { VeloxLogo } from '@/components/velox/velox-logo'
import { LanguageProvider, useLanguage } from '@/components/velox/language-context'
import { LanguageSwitcher } from '@/components/velox/language-switcher'
import { getAuthTranslations } from '@/components/velox/auth/auth-translations'

type RecoveryMode = 'request' | 'reset'

export function PasswordRecoveryForm({
  mode,
  token = '',
  invalidToken = false,
}: {
  mode: RecoveryMode
  token?: string
  invalidToken?: boolean
}) {
  return (
    <LanguageProvider>
      <LocalizedPasswordRecoveryForm mode={mode} token={token} invalidToken={invalidToken} />
    </LanguageProvider>
  )
}

function LocalizedPasswordRecoveryForm({
  mode,
  token,
  invalidToken,
}: {
  mode: RecoveryMode
  token: string
  invalidToken: boolean
}) {
  const { language, direction } = useLanguage()
  const copy = getAuthTranslations(language)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(invalidToken || (mode === 'reset' && !token) ? copy.invalidToken : null)

  async function submitRequest(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const { error: requestError } = await authClient.requestPasswordReset({ email, redirectTo })
      if (requestError) setError(requestError.message ?? copy.genericError)
      else setMessage(copy.resetSent)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.genericError)
    } finally {
      setLoading(false)
    }
  }

  async function submitReset(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!token) {
      setError(copy.invalidToken)
      return
    }
    if (password !== confirmation) {
      setError(copy.passwordMismatch)
      return
    }
    setLoading(true)
    try {
      const { error: resetError } = await authClient.resetPassword({ newPassword: password, token })
      if (resetError) setError(resetError.message ?? copy.invalidToken)
      else setMessage(copy.resetSuccess)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.genericError)
    } finally {
      setLoading(false)
    }
  }

  const isReset = mode === 'reset'
  const disabled = loading || (isReset && (!token || invalidToken))

  return (
    <div className="w-full max-w-md" dir={direction}>
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher />
      </div>
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <VeloxLogo size={30} />
        <div>
          <h1 className="text-xl font-semibold text-foreground">{isReset ? copy.resetTitle : copy.forgotTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{isReset ? copy.resetSubtitle : copy.forgotSubtitle}</p>
        </div>
      </div>

      <form
        onSubmit={isReset ? submitReset : submitRequest}
        className="rounded-xl border border-border bg-card p-6 shadow-lg shadow-black/20"
      >
        {isReset ? (
          <>
            <RecoveryField label={copy.newPassword} htmlFor="new-password">
              <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required placeholder={copy.passwordPlaceholder} className="velox-input" />
            </RecoveryField>
            <RecoveryField label={copy.confirmPassword} htmlFor="confirm-password">
              <input id="confirm-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required placeholder={copy.passwordPlaceholder} className="velox-input" />
            </RecoveryField>
          </>
        ) : (
          <RecoveryField label={copy.email} htmlFor="recovery-email">
            <input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="ornek@eposta.com" className="velox-input" />
          </RecoveryField>
        )}

        {error && <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}
        {message && <div className="mb-4 flex items-start gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-xs text-success"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{message}</div>}

        {!message && (
          <button type="submit" disabled={disabled} className={cn('velox-gradient inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60')}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : isReset ? <KeyRound className="size-4" /> : <Mail className="size-4" />}
            {isReset ? copy.resetPassword : copy.sendResetLink}
            {!loading && <ArrowRight className="size-4" />}
          </button>
        )}
      </form>

      <p className="mt-5 text-center text-sm">
        <Link href="/sign-in" className="inline-flex items-center gap-1 font-medium text-electric hover:underline">
          <ArrowLeft className="size-4" /> {copy.backToSignIn}
        </Link>
      </p>
    </div>
  )
}

function RecoveryField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-secondary-foreground">{label}</label>
      {children}
    </div>
  )
}
