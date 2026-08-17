'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './language-switcher'
import { useLanguage } from './language-context'

export function TopNav({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useLanguage()
  const topLinks = [
    { label: t.topArbitrage, href: '/arbitraj' },
    { label: t.topTrading, href: '/velox-trade' },
    { label: t.topAutoWithdraw, href: '/auto-withdraw' },
  ]

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenSidebar}
        aria-label={t.panel}
      >
        <Menu />
      </Button>

      <nav className="flex items-center gap-1">
        {topLinks.map((link) => {
          const active =
            pathname === link.href || (link.href === '/arbitraj' && pathname === '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'hidden rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors sm:inline-flex',
                active
                  ? 'velox-gradient text-primary-foreground'
                  : 'text-secondary-foreground hover:bg-elevated hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          )
        })}

        {/* USDT selector */}
        <button
          type="button"
          className="ml-1 hidden items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-elevated md:inline-flex"
        >
          <span className="size-2 rounded-full bg-cyan" />
          USDT
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <Link
          href="/deposit"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'hidden sm:inline-flex')}
        >
          <Wallet />
          {t.deposit}
        </Link>
        <Link
          href="/deposit"
          className={cn(
            buttonVariants({ size: 'sm' }),
            'hidden velox-gradient text-primary-foreground sm:inline-flex',
          )}
        >
          <ShoppingCart />
          {t.buy}
        </Link>

        <Link
          href="/admin"
          className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[13px] font-medium text-secondary-foreground transition-colors hover:bg-elevated hover:text-foreground md:inline-flex"
        >
          <ShieldCheck className="size-4 text-cyan" />
          {t.management}
        </Link>

        <Button variant="ghost" size="icon-sm" aria-label={t.notifications} className="relative">
          <Bell />
          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-cyan" />
        </Button>

        <LanguageSwitcher />

        <div className="relative">
          <button
            type="button"
            aria-label="Profil menüsü"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex size-8 items-center justify-center rounded-full border border-border bg-elevated text-bright transition-colors hover:border-cyan/40"
          >
            <UserRound className="size-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-40 w-44 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg shadow-black/40">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-elevated hover:text-foreground"
                >
                  <Settings className="size-4" />
                  {t.settings}
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition-colors hover:bg-elevated"
                >
                  <LogOut className="size-4" />
                  {t.signOut}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
