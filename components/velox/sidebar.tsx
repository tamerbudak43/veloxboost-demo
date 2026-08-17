'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navSections } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { VeloxLogo } from './velox-logo'
import { useLanguage } from './language-context'

function isActive(pathname: string, href: string) {
  if (href === '/arbitraj') return pathname === '/' || pathname === '/arbitraj'
  return pathname === href
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const sectionLabels: Record<string, string> = {
    'NAVİGASYON — PANEL': t.panel, 'NAVİGASYON — KONTROL': t.control, AĞ: t.network, HESAP: t.account,
  }
  const itemLabels: Record<string, string> = {
    '/arbitraj': t.arbitrage, '/arbitraj-pro': t.arbitragePro, '/arbitraj-havuzlari': t.pools, '/velox-trade': t.trade, '/liquidity': t.liquidity, '/pool-percentage': t.poolPercent,
    '/reports': t.reports, '/documents': t.documents, '/contracts': t.allContracts, '/my-contracts': t.myContracts, '/investor-statistics': t.investorStats, '/marketing-statistics': t.marketingStats, '/career': t.career, '/products': t.products,
    '/partner-program': t.partnerProgram, '/partner-challenge': t.partnerChallenge, '/partner-boost': t.partnerBoost, '/partners': t.networkProgram, '/ranks': t.ranks,
    '/settings': t.accountSettings, '/faq': t.faq, '/help': t.help,
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
        <Link href="/arbitraj" onClick={onNavigate} aria-label="VELOX ana sayfa">
          <VeloxLogo size={22} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {sectionLabels[section.title] ?? section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <li key={item.label + item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'group flex items-center gap-2.5 rounded-md border border-transparent px-2 py-1.5 text-[13px] font-medium transition-colors',
                        active
                          ? 'border-cyan/30 bg-electric/10 text-foreground shadow-[0_0_0_1px_rgba(24,212,232,0.08),0_0_16px_-6px_rgba(24,212,232,0.5)]'
                          : 'text-sidebar-foreground hover:bg-elevated/60 hover:text-foreground',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-4 shrink-0',
                          active ? 'text-bright' : 'text-muted-foreground group-hover:text-bright',
                        )}
                      />
                    <span className="truncate">{itemLabels[item.href] ?? item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border px-4 py-3">
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          {t.terminal}
        </p>
      </div>
    </div>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[186px] border-r border-sidebar-border lg:block">
      <SidebarContent />
    </aside>
  )
}
