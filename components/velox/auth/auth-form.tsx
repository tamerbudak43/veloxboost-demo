'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowRight, CheckCircle2, XCircle, UserPlus, LogIn } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { createMemberProfile, validateReferralCode } from '@/app/actions/member'
import { VeloxLogo } from '@/components/velox/velox-logo'
import { LanguageProvider, useLanguage } from '@/components/velox/language-context'
import { LanguageSwitcher } from '@/components/velox/language-switcher'
import { getAuthTranslations } from '@/components/velox/auth/auth-translations'
import { cn } from '@/lib/utils'

type Mode = 'sign-in' | 'sign-up'

export function AuthForm({
  mode,
  initialReferral = '',
}: {
  mode: Mode
  initialReferral?: string
}) {
  return (
    <LanguageProvider>
      <LocalizedAuthForm mode={mode} initialReferral={initialReferral} />
    </LanguageProvider>
  )
}

function LocalizedAuthForm({
  mode,
  initialReferral,
}: {
  mode: Mode
  initialReferral: string
}) {
  const router = useRouter()
  const isSignUp = mode === 'sign-up'
  const { language, direction } = useLanguage()
  const copy = getAuthTranslations(language)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referral, setReferral] = useState(initialReferral)
  const [refState, setRefState] = useState<'idle' | 'checking' | 'valid' | 'invalid'>(
    initialReferral ? 'idle' : 'idle',
  )
  const [refSponsor, setRefSponsor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function checkReferral(code: string) {
    if (!code.trim()) {
      setRefState('idle')
      setRefSponsor(null)
      return
    }
    setRefState('checking')
    try {
      const res = await validateReferralCode(code)
      if (res.valid) {
        setRefState('valid')
        setRefSponsor(res.sponsorName ?? null)
      } else {
        setRefState('invalid')
        setRefSponsor(null)
      }
    } catch {
      setRefState('invalid')
      setRefSponsor(null)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const { error: signUpError } = await authClient.signUp.email({ email, password, name })
        if (signUpError) {
          setError(signUpError.message ?? copy.signUpFailed)
          setLoading(false)
          return
        }
        // Create the VELOX network profile + binary placement.
        await createMemberProfile({ name, email, referralCode: referral })
      } else {
        const { error: signInError } = await authClient.signIn.email({ email, password })
        if (signInError) {
          setError(signInError.message ?? copy.signInFailed)
          setLoading(false)
          return
        }
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.genericError)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md" dir={direction}>
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher />
      </div>
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <VeloxLogo size={30} />
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {isSignUp ? copy.signUpTitle : copy.signInTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp ? copy.signUpSubtitle : copy.signInSubtitle}
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-border bg-card p-6 shadow-lg shadow-black/20"
      >
        {isSignUp && (
          <Field label={copy.fullName} htmlFor="name">
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={copy.namePlaceholder}
              className="velox-input"
            />
          </Field>
        )}

        <Field label={copy.email} htmlFor="email">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ornek@eposta.com"
            className="velox-input"
          />
        </Field>

        <Field
          label={copy.password}
          htmlFor="password"
          hint={!isSignUp ? (
            <Link href="/forgot-password" className="font-medium text-electric hover:underline">
              {copy.forgotPassword}
            </Link>
          ) : null}
        >
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder={copy.passwordPlaceholder}
            className="velox-input"
          />
        </Field>

        {isSignUp && (
          <Field
            label={copy.referral}
            htmlFor="referral"
            hint={
              refState === 'checking' ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" /> {copy.checking}
                </span>
              ) : refState === 'valid' ? (
                <span className="inline-flex items-center gap-1 text-success">
                  <CheckCircle2 className="size-3" /> {copy.invitedBy.replace('{name}', refSponsor ?? '')}
                </span>
              ) : refState === 'invalid' ? (
                <span className="inline-flex items-center gap-1 text-destructive">
                  <XCircle className="size-3" /> {copy.codeNotFound}
                </span>
              ) : null
            }
          >
            <input
              id="referral"
              value={referral}
              onChange={(e) => setReferral(e.target.value.toUpperCase())}
              onBlur={(e) => checkReferral(e.target.value)}
              placeholder={copy.referralPlaceholder}
              className="velox-input font-mono uppercase"
            />
          </Field>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'velox-gradient inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60',
          )}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isSignUp ? (
            <UserPlus className="size-4" />
          ) : (
            <LogIn className="size-4" />
          )}
          {isSignUp ? copy.createAccount : copy.signIn}
          {!loading && <ArrowRight className="size-4" />}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            {copy.alreadyAccount}{' '}
            <Link href="/sign-in" className="font-medium text-electric hover:underline">
              {copy.signIn}
            </Link>
          </>
        ) : (
          <>
            {copy.noAccount}{' '}
            <Link href="/sign-up" className="font-medium text-electric hover:underline">
              {copy.register}
            </Link>
          </>
        )}
      </p>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-xs font-medium text-secondary-foreground">
          {label}
        </label>
        {hint && <span className="text-[11px]">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
