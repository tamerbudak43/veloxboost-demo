'use client'

import { useState, useTransition } from 'react'
import { Search, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react'
import { Panel, PanelHeader, Eyebrow, StatusPill } from '@/components/velox/primitives'
import { DataTable, type Column } from '@/components/velox/data-table'
import { searchMembers, setMemberRole } from '@/app/actions/admin'
import { formatUSDT, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export type AdminMember = {
  userId: string
  name: string
  email: string
  veloxId: string
  referralCode: string
  sponsorId: string | null
  role: string
  status: string
  career: string
  personalVolume: number
  teamVolume: number
  balance: number
  directCount: number
  createdAt: string | Date
}

export function AdminNetwork({ initialMembers }: { initialMembers: AdminMember[] }) {
  const [rows, setRows] = useState<AdminMember[]>(initialMembers)
  const [query, setQuery] = useState('')
  const [searching, startSearch] = useTransition()
  const [roleBusy, setRoleBusy] = useState<string | null>(null)

  function runSearch(e: React.FormEvent) {
    e.preventDefault()
    startSearch(async () => {
      const res = await searchMembers(query)
      setRows(res as AdminMember[])
    })
  }

  async function toggleRole(m: AdminMember) {
    setRoleBusy(m.userId)
    try {
      const next = m.role === 'admin' ? 'member' : 'admin'
      await setMemberRole(m.userId, next)
      setRows((prev) =>
        prev.map((r) => (r.userId === m.userId ? { ...r, role: next } : r)),
      )
    } catch (err) {
      // Surface the guard error (e.g. self-demotion) without crashing the table.
      alert(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setRoleBusy(null)
    }
  }

  const columns: Column<AdminMember>[] = [
    {
      key: 'name',
      header: 'Üye',
      cell: (m) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{m.name}</span>
            {m.role === 'admin' && (
              <span className="rounded border border-electric/40 bg-electric/10 px-1.5 py-0.5 text-[10px] font-semibold text-electric">
                ADMIN
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{m.email}</div>
        </div>
      ),
    },
    { key: 'veloxId', header: 'VELOX ID', cell: (m) => <span className="font-mono text-xs">{m.veloxId}</span> },
    { key: 'career', header: 'Kariyer', cell: (m) => <span className="text-xs font-semibold text-bright">{m.career}</span> },
    {
      key: 'status',
      header: 'Durum',
      cell: (m) => (
        <StatusPill tone={m.status === 'active' ? 'success' : m.status === 'qualified' ? 'active' : 'neutral'}>
          {m.status}
        </StatusPill>
      ),
    },
    { key: 'directCount', header: 'Direkt', align: 'right', cell: (m) => m.directCount },
    { key: 'teamVolume', header: 'Takım Hacmi', align: 'right', cell: (m) => <span className="font-mono text-xs">{formatUSDT(m.teamVolume)}</span> },
    { key: 'balance', header: 'Bakiye', align: 'right', cell: (m) => <span className="font-mono text-xs">{formatUSDT(m.balance)}</span> },
    { key: 'createdAt', header: 'Katılım', cell: (m) => <span className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (m) => (
        <button
          type="button"
          onClick={() => toggleRole(m)}
          disabled={roleBusy === m.userId}
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors disabled:opacity-60',
            m.role === 'admin'
              ? 'border-destructive/40 text-destructive hover:bg-destructive/10'
              : 'border-electric/40 text-electric hover:bg-electric/10',
          )}
        >
          {roleBusy === m.userId ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : m.role === 'admin' ? (
            <>
              <ShieldOff className="size-3.5" /> Yetkiyi al
            </>
          ) : (
            <>
              <ShieldCheck className="size-3.5" /> Admin yap
            </>
          )}
        </button>
      ),
    },
  ]

  return (
    <Panel>
      <PanelHeader
        title="Ağ Arama"
        right={<Eyebrow>{rows.length} sonuç</Eyebrow>}
      />
      <form onSubmit={runSearch} className="flex items-center gap-2 border-b border-border p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim, e-posta veya VELOX ID ara"
            className="velox-input h-9 pl-8"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="inline-flex h-9 items-center gap-2 rounded-md velox-gradient px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {searching ? <Loader2 className="size-4 animate-spin" /> : 'Ara'}
        </button>
      </form>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(m) => m.userId}
        empty={{ title: 'Üye bulunamadı', description: 'Farklı bir arama terimi deneyin.' }}
      />
    </Panel>
  )
}
