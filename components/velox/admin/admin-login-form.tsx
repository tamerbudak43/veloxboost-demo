'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { checkAdminAccess } from '@/app/actions/admin'
import { VeloxLogo } from '@/components/velox/velox-logo'

export function AdminLoginForm({ denied = false }: { denied?: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(denied ? 'Bu hesabın yönetici yetkisi yok.' : null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authClient.signIn.email({ email, password })
      if (res.error) {
        setError('E-posta veya parola hatalı.')
        return
      }
      // Verify the signed-in account actually has the admin role.
      const isAdmin = await checkAdminAccess()
      if (!isAdmin) {
        await authClient.signOut()
        setError('Bu hesabın yönetici yetkisi yok.')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Giriş yapılamadı. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center gap-2">
          <VeloxLogo size={26} />
          <span className="rounded bg-electric/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-bright">
            Admin
          </span>
        </div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-bright">
          <ShieldCheck className="size-5 text-electric" />
          Operasyon Konsolu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yönetici hesabınla giriş yaparak devam et.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-border bg-card p-5 shadow-lg shadow-black/20"
      >
        {error && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <label className="mb-1.5 block text-xs font-medium text-secondary-foreground" htmlFor="admin-email">
          Yönetici e-postası
        </label>
        <input
          id="admin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@velox.trade"
          className="velox-input mb-4"
        />

        <label className="mb-1.5 block text-xs font-medium text-secondary-foreground" htmlFor="admin-pass">
          Parola
        </label>
        <input
          id="admin-pass"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parolan"
          className="velox-input mb-5"
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md velox-gradient text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Giriş yapılıyor
            </>
          ) : (
            <>
              Konsola gir <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
