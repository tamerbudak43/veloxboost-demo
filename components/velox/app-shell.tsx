'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DesktopSidebar, SidebarContent } from './sidebar'
import { TopNav } from './top-nav'
import { LanguageProvider, useLanguage } from './language-context'
import { AutoTranslate } from './ui-auto-translator'

export function AppShell({ children }: { children: React.ReactNode }) {
  return <LanguageProvider><LocalizedAppShell>{children}</LocalizedAppShell></LanguageProvider>
}

function LocalizedAppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { direction, t } = useLanguage()

  return (
    <div dir={direction} className="min-h-screen bg-background">
      <DesktopSidebar />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={t.closeMenu}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 w-[240px] border-e border-sidebar-border">
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute end-2 top-2 z-10"
              onClick={() => setMobileOpen(false)}
              aria-label={t.closeMenu}
            >
              <X />
            </Button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:ps-[186px]">
        <TopNav onOpenSidebar={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 lg:px-6">
          <AutoTranslate>{children}</AutoTranslate>
        </main>
      </div>
    </div>
  )
}
