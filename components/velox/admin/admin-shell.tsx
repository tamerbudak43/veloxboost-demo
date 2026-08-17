'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  FileText,
  Waves,
  ArrowLeft,
  ShieldCheck,
  Award,
  Percent,
  Network,
  DatabaseZap,
  LogOut,
} from 'lucide-react'
import { VeloxLogo } from '@/components/velox/velox-logo'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const adminNav = [
  { label: 'Genel Bakış', href: '/admin', icon: LayoutDashboard },
  { label: 'Kullanıcılar', href: '/admin/users', icon: Users },
  { label: 'Ağ Arama', href: '/admin/network', icon: Network },
  { label: 'Faz 1 Demo', href: '/admin/demo-simulation', icon: DatabaseZap },
  { label: 'Kariyer Yönetimi', href: '/admin/careers', icon: Award },
  { label: 'Komisyon Seviyeleri', href: '/admin/commissions', icon: Percent },
  { label: 'Çekim Onayları', href: '/admin/withdrawals', icon: ArrowDownToLine },
  { label: 'Yatırım Belgeleri', href: '/admin/investment-receipts', icon: FileText },
  { label: 'Havuz & Faz', href: '/admin/pools', icon: Waves },
]

export function AdminShell({
  children,
  adminName = 'Yönetici',
}: {
  children: React.ReactNode
  adminName?: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/admin-login')
    router.refresh()
  }

  const initials = adminName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Admin sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-elevated lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <VeloxLogo size={22} />
          <span className="rounded bg-electric/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bright">
            Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Operasyon
          </div>
          <ul className="space-y-1">
            {adminNav.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-electric/10 font-medium text-bright'
                        : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-3 py-4">
          <Link
            href="/arbitraj"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Yatırımcı paneline dön
          </Link>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col lg:pl-60">
        {/* Admin top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-sm font-medium">VELOX Operasyon Konsolu</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{adminName}</span>
            <div className="flex size-8 items-center justify-center rounded-full velox-gradient text-xs font-semibold text-primary-foreground">
              {initials || 'OP'}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Çıkış yap"
              className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
