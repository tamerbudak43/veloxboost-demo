'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Users, Zap } from 'lucide-react'
import { PartnerAvatar } from '@/components/velox/network/partner-avatar'
import { StatusPill } from '@/components/velox/primitives'
import { formatUSDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { SponsorTreeNode } from '@/lib/network/types'

const statusMeta: Record<
  SponsorTreeNode['status'],
  { tone: 'success' | 'active' | 'neutral'; label: string }
> = {
  qualified: { tone: 'success', label: 'Nitelikli' },
  active: { tone: 'active', label: 'Aktif' },
  inactive: { tone: 'neutral', label: 'Pasif' },
}

/** A single node card in the org-chart style tree. */
function NodeCard({
  node,
  open,
  onToggle,
}: {
  node: SponsorTreeNode
  open: boolean
  onToggle: () => void
}) {
  const hasChildren = node.children.length > 0

  return (
    <div
      className={cn(
        'relative flex w-48 flex-col items-center rounded-xl border px-3 pb-3 pt-4 text-center transition-colors',
        node.isSelf
          ? 'border-transparent [background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(135deg,#0877e8,#18d4e8)_border-box]'
          : node.isStrongLeg
            ? 'border-cyan/40 bg-cyan/5'
            : node.status === 'qualified'
              ? 'border-electric/30 bg-card'
              : 'border-border bg-card',
      )}
    >
      {(node.isSelf || node.isStrongLeg) && (
        <span
          className={cn(
            'absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
            node.isSelf
              ? 'bg-electric/15 text-bright'
              : 'inline-flex items-center gap-0.5 bg-cyan/15 text-light-cyan',
          )}
        >
          {node.isSelf ? 'Siz' : (
            <>
              <Zap className="size-2.5" /> Güçlü Bacak
            </>
          )}
        </span>
      )}

      <PartnerAvatar name={node.name} seed={node.veloxId} className="size-12 text-sm" />

      <span className="mt-2 line-clamp-1 text-sm font-semibold text-foreground">{node.name}</span>
      <span className="font-mono text-[10px] text-muted-foreground">{node.veloxId}</span>

      <div className="mt-1.5">
        <StatusPill tone={statusMeta[node.status].tone}>{node.career}</StatusPill>
      </div>

      <div className="mt-2 w-full rounded-md bg-elevated px-2 py-1.5">
        <div className="font-mono text-xs tabular-nums text-foreground">
          {formatUSDT(node.teamVolume, 0)}
        </div>
        <div className="text-[10px] text-muted-foreground">ekip hacmi</div>
      </div>

      {hasChildren && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? 'Daralt' : 'Genişlet'}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-border bg-elevated px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Users className="size-3" />
          {node.directCount} direkt
          {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        </button>
      )}
    </div>
  )
}

/** Recursive org-chart node: card on top, connector lines, children row below. */
function TreeNode({ node, defaultOpen }: { node: SponsorTreeNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const hasChildren = node.children.length > 0
  const showChildren = hasChildren && open

  return (
    <div className="flex flex-col items-center">
      <NodeCard node={node} open={open} onToggle={() => setOpen((o) => !o)} />

      {showChildren && (
        <>
          {/* vertical stub dropping from the parent card */}
          <div className="h-6 w-px bg-border" />

          {/* children row with connector bars */}
          <div className="flex items-start">
            {node.children.map((child, i) => {
              const isFirst = i === 0
              const isLast = i === node.children.length - 1
              const isOnly = node.children.length === 1
              return (
                <div key={child.id} className="flex flex-col items-center px-3">
                  {/* connector segment above each child */}
                  <div className="relative h-6 w-full">
                    {/* vertical line down to the child card */}
                    <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
                    {/* horizontal bar linking siblings (skip for single child) */}
                    {!isOnly && !isFirst && (
                      <div className="absolute right-1/2 top-0 h-px w-1/2 bg-border" />
                    )}
                    {!isOnly && !isLast && (
                      <div className="absolute left-1/2 top-0 h-px w-1/2 bg-border" />
                    )}
                  </div>
                  <TreeNode node={child} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export function SponsorTree({ root }: { root: SponsorTreeNode | null }) {
  if (!root) {
    return (
      <div className="px-4 py-14 text-center text-sm text-muted-foreground">
        Ağ verisi bulunamadı.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto p-6">
      <div className="flex min-w-max justify-center">
        <TreeNode node={root} defaultOpen />
      </div>
    </div>
  )
}
