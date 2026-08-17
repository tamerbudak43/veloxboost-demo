'use client'

import { useState } from 'react'
import { Check, Copy, Link2, Percent, UsersRound } from 'lucide-react'
import { PageHeader, Panel, PanelHeader, StatTile, StatusPill } from '@/components/velox/primitives'
import { formatUSDT } from '@/lib/format'

type DirectPartner = {
  userId: string
  name: string
  email: string
  veloxId: string
  status: string
  career: string
  turnover: number
  commission: number
  createdAt: string
}

export function DirectReferralDashboard({
  referralCode,
  directCount,
  directTurnover,
  commissionRate,
  simulatedCommission,
  partners,
}: {
  referralCode: string
  directCount: number
  directTurnover: number
  commissionRate: number
  simulatedCommission: number
  partners: DirectPartner[]
}) {
  const [copied, setCopied] = useState(false)
  const referralLink = `https://www.veloxboost.online/sign-up?ref=${encodeURIComponent(referralCode)}`

  async function copyLink() {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div>
      <PageHeader
        title="Partner Programı — Doğrudan Referans"
        description="Bu alan günlük arbitraj kazancından ayrıdır. Yalnızca size doğrudan bağlı referansların cirosu ve %6 demo komisyon görünümünü gösterir."
      />

      <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Demo simülasyonu: Ciro ve %6 komisyon değerleri yalnızca arayüz örneğidir; gerçek ödeme, bakiye, çekim veya hak ediş kaydı oluşturmaz.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Doğrudan referans" value={String(directCount)} hint="Sadece ilk seviye" accent />
        <StatTile label="Doğrudan referans cirosu" value={formatUSDT(directTurnover, 2)} hint="Kayıtlı kişisel ciro toplamı" />
        <StatTile label="Referans komisyon oranı" value={`%${commissionRate}`} hint="Günlük arbitrajdan bağımsız" />
        <StatTile label="%6 demo komisyon" value={formatUSDT(simulatedCommission, 2)} hint="Ödeme yapılmaz" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_.85fr]">
        <Panel>
          <PanelHeader title="Doğrudan referanslarınız" right={<span className="text-xs text-muted-foreground">İlk seviye · {directCount} kişi</span>} />
          {partners.length === 0 ? (
            <div className="px-5 py-12 text-center"><UsersRound className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium text-foreground">Henüz doğrudan referans yok</p><p className="mt-1 text-xs text-muted-foreground">Referans kodunuzu paylaşarak bu listeyi oluşturabilirsiniz.</p></div>
          ) : (
            <div className="divide-y divide-border">
              {partners.map((partner) => <DirectPartnerRow key={partner.userId} partner={partner} />)}
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Referans bağlantınız" right={<Link2 className="size-4 text-cyan" />} />
            <div className="p-4">
              <p className="font-mono text-sm font-semibold text-foreground">{referralCode}</p>
              <p className="mt-2 break-all rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">{referralLink}</p>
              <button type="button" onClick={copyLink} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan/40 px-3 py-2 text-sm font-medium text-cyan transition-colors hover:bg-cyan/10">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? 'Kopyalandı' : 'Bağlantıyı kopyala'}</button>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Komisyon kapsamı" right={<Percent className="size-4 text-cyan" />} />
            <div className="space-y-3 p-4 text-sm text-secondary-foreground">
              <p><span className="font-semibold text-foreground">Dahil:</span> Size doğrudan bağlı üyelerin kayıtlı kişisel cirosu.</p>
              <p><span className="font-semibold text-foreground">Oran:</span> %6 demo hesaplama.</p>
              <p><span className="font-semibold text-foreground">Hariç:</span> Günlük arbitraj, çok seviyeli ağ kazancı ve gerçek çekim işlemleri.</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function DirectPartnerRow({ partner }: { partner: DirectPartner }) {
  const date = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeZone: 'Europe/Istanbul' }).format(new Date(partner.createdAt))
  const active = partner.status === 'active' || partner.status === 'qualified'
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{partner.name} <span className="font-mono text-xs text-muted-foreground">{partner.veloxId}</span></p><p className="mt-1 text-xs text-muted-foreground">{partner.email} · {date} · {partner.career}</p></div>
      <div className="flex items-center gap-5 sm:gap-7"><div className="text-right"><p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Ciro</p><p className="mt-1 font-mono text-sm font-semibold text-foreground">{formatUSDT(partner.turnover, 2)}</p></div><div className="text-right"><p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">%6 demo</p><p className="mt-1 font-mono text-sm font-semibold text-light-cyan">{formatUSDT(partner.commission, 2)}</p></div><StatusPill tone={active ? 'success' : 'neutral'}>{active ? 'Aktif' : 'Pasif'}</StatusPill></div>
    </div>
  )
}
