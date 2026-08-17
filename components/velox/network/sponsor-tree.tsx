'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Users } from 'lucide-react'
import { formatUSDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { SponsorTreeNode } from '@/lib/network/types'

/** A single node card in the org-chart style tree. */
function NodeCard({
  node,
  open,
  onToggle,
  placement,
}: {
  node: SponsorTreeNode
  open: boolean
  onToggle: () => void
  placement?: 'Sol' | 'Sağ'
}) {
  const hasChildren = node.children.length > 0

  return (
    <div
      className={cn(
        'relative flex w-36 flex-col rounded-md border px-2.5 py-2 text-left transition-colors',
        node.isSelf
          ? 'border-transparent [background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(135deg,#0877e8,#18d4e8)_border-box]'
          : node.isStrongLeg
            ? 'border-cyan/40 bg-cyan/5'
            : node.status === 'qualified'
              ? 'border-electric/30 bg-card'
              : 'border-border bg-card',
      )}
    >
      {node.isSelf && (
        <span
          className={cn(
            'absolute -top-1.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide',
            'bg-electric/15 text-bright',
          )}
        >
          Siz
        </span>
      )}

      <span className={cn('line-clamp-1 text-[10px] font-semibold', node.isSelf ? 'text-cyan' : 'text-foreground')}>{node.name}</span>
      <span className="mt-0.5 text-[9px] text-muted-foreground">{node.isSelf ? 'Ana hesap' : `${placement ?? 'Alt'} bacak`} · {node.career}</span>
      <span className="mt-1 font-mono text-[9px] tabular-nums text-secondary-foreground">Yatırım: {formatUSDT(node.personalVolume, 0)}</span>
      <span className="max-w-full truncate font-mono text-[8px] text-muted-foreground">{node.veloxId} · Ekip: {formatUSDT(node.teamVolume, 0)}</span>

      {hasChildren && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? 'Daralt' : 'Genişlet'}
          className="mt-1 inline-flex w-fit items-center gap-0.5 rounded border border-border bg-elevated px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Users className="size-2.5" />
          {node.directCount} direkt
          {open ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
        </button>
      )}
    </div>
  )
}

/** Recursive org-chart node: card on top, connector lines, children row below. */
function TreeNode({ nodes, index, depth = 0, placement }: { nodes: SponsorTreeNode[]; index: number; depth?: number; placement?: 'Sol' | 'Sağ' }) {
  const node = nodes[index]
  // Root + two matrix rows are open on first view: 1 → 2 → 4.
  const [open, setOpen] = useState(depth < 2)
  const children = [nodes[index * 2 + 1], nodes[index * 2 + 2]].filter(Boolean) as SponsorTreeNode[]
  const hasChildren = children.length > 0
  const showChildren = hasChildren && open

  return (
    <div className="flex flex-col items-center">
      <NodeCard node={node} open={open} onToggle={() => setOpen((o) => !o)} placement={placement} />

      {showChildren && (
        <>
          {/* vertical stub dropping from the parent card */}
          <div className="h-3 w-px bg-border" />

          {/* children row with connector bars */}
          <div className="flex items-start">
            {children.map((child, i) => {
              const isFirst = i === 0
              const isLast = i === node.children.length - 1
              const isOnly = node.children.length === 1
              return (
                <div key={child.id} className="flex flex-col items-center px-1.5">
                  {/* connector segment above each child */}
                  <div className="relative h-3 w-full">
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
                  <TreeNode nodes={nodes} index={index * 2 + i + 1} depth={depth + 1} placement={i === 0 ? 'Sol' : 'Sağ'} />
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

  // Existing sponsor data can have more than two direct records. For the
  // matrix visual it is read breadth-first and placed into fixed binary slots
  // (1 → 2 → 4 → 8). New demo records are also written with this same rule.
  const nodes: SponsorTreeNode[] = []
  const queue = [root]
  while (queue.length) {
    const current = queue.shift()
    if (!current) continue
    nodes.push(current)
    queue.push(...current.children)
  }

  return (
    <div className="overflow-x-auto p-3">
      <div className="flex min-w-max justify-center">
        <TreeNode nodes={nodes} index={0} />
      </div>
    </div>
  )
}
