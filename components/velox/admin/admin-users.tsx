'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Panel, StatTile, StatusPill } from '@/components/velox/primitives'
import { PartnerAvatar } from '@/components/velox/network/partner-avatar'
import { formatUSDT, formatDate, formatNumber, safeArray } from '@/lib/format'
import type { AdminUser } from '@/lib/types'

function statusPill(status: string) {
  if (status === 'active') return <StatusPill tone="success">Aktif</StatusPill>
  if (status === 'suspended') return <StatusPill tone="danger">Askıda</StatusPill>
  return <StatusPill tone="warning">Beklemede</StatusPill>
}

function kycPill(kyc: string) {
  if (kyc === 'verified') return <StatusPill tone="success">Doğrulandı</StatusPill>
  if (kyc === 'rejected') return <StatusPill tone="danger">Reddedildi</StatusPill>
  return <StatusPill tone="warning">Beklemede</StatusPill>
}

export function AdminUsers({ users: initialUsers }: { users: AdminUser[] }) {
  const users = safeArray<AdminUser>(initialUsers)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.veloxId.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      const matchesFilter = filter === 'all' || u.status === filter
      return matchesQuery && matchesFilter
    })
  }, [users, query, filter])

  const totalBalance = users.reduce((s, u) => s + (Number(u?.balance) || 0), 0)
  const activeCount = users.filter((u) => u?.status === 'active').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Kullanıcılar</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Platform kullanıcılarını görüntüleyin, durum ve KYC bilgilerini yönetin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Toplam kullanıcı" value={formatNumber(users.length, 0)} />
        <StatTile label="Aktif" value={formatNumber(activeCount, 0)} />
        <StatTile label="Toplam bakiye" value={formatUSDT(totalBalance, 0)} accent />
      </div>

      <Panel className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim, VLX ID veya e-posta"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'active', 'suspended', 'pending'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? 'border-electric/40 bg-electric/10 text-bright'
                    : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : f === 'suspended' ? 'Askıda' : 'Beklemede'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Kullanıcı</th>
                <th className="px-5 py-3 font-medium">Kariyer</th>
                <th className="px-5 py-3 text-right font-medium">Bakiye</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium">KYC</th>
                <th className="px-5 py-3 text-right font-medium">Katılım</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    Eşleşen kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <PartnerAvatar seed={u.veloxId} name={u.name} />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{u.name}</div>
                          <div className="truncate font-mono text-xs text-muted-foreground">
                            {u.veloxId} · {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.career}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">
                      {formatUSDT(u.balance, 2)}
                    </td>
                    <td className="px-5 py-3">{statusPill(u.status)}</td>
                    <td className="px-5 py-3">{kycPill(u.kyc)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-muted-foreground tabular-nums">
                      {formatDate(u.joinedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
