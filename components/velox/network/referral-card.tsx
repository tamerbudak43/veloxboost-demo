'use client'

import { useState } from 'react'
import { Copy, Check, Share2, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Panel, PanelHeader } from '@/components/velox/primitives'
import { demoUser } from '@/lib/demo-data'

export function ReferralCard({ referralCode }: { referralCode?: string }) {
  const code = referralCode || demoUser.referralCode
  const link = `https://velox.trade/r/${code}`
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const copy = async (value: string, which: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(value)
      if (which === 'link') {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 1600)
      } else {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 1600)
      }
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Panel>
      <PanelHeader title="Davet bağlantınız" right={<Share2 className="size-4 text-muted-foreground" />} />
      <div className="p-4">
        <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          <Link2 className="size-3.5" /> Referans bağlantısı
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground">
            {link}
          </code>
          <Button variant="outline" size="icon-sm" aria-label="Bağlantıyı kopyala" onClick={() => copy(link, 'link')}>
            {copiedLink ? <Check className="text-light-cyan" /> : <Copy />}
          </Button>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Referans kodu</span>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded-md border border-electric/30 bg-electric/10 px-3 py-2 font-mono text-sm font-semibold text-bright">
                {code}
              </span>
              <Button variant="ghost" size="sm" onClick={() => copy(code, 'code')}>
                {copiedCode ? <Check className="text-light-cyan" /> : <Copy />}
                Kopyala
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
