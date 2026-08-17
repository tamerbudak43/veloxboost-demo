'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DesktopSidebar, SidebarContent } from './sidebar'
import { TopNav } from './top-nav'
import { LanguageProvider } from './language-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <LanguageProvider>
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[240px] border-r border-sidebar-border">
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-2 z-10"
              onClick={() => setMobileOpen(false)}
              aria-label="Kapat"
            >
              <X />
            </Button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-[186px]">
        <TopNav onOpenSidebar={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 lg:px-6">
          {children}
        </main>
      </div>
    </div>
    </LanguageProvider>
  )
}
