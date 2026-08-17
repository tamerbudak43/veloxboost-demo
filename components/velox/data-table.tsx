import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/velox/primitives'

export interface Column<T> {
  key: string
  header: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
  cell: (row: T, index: number) => ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  empty,
  getRowKey,
  className,
}: {
  columns: Column<T>[]
  rows: T[]
  empty?: { title?: string; description?: string; icon?: ReactNode }
  getRowKey: (row: T, index: number) => string
  className?: string
}) {
  const safeRows = Array.isArray(rows) ? rows : []

  if (safeRows.length === 0) {
    return (
      <EmptyState
        title={empty?.title}
        description={empty?.description}
        icon={empty?.icon}
      />
    )
  }

  const alignClass = (align?: 'left' | 'right' | 'center') =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground',
                  alignClass(col.align),
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              className="border-b border-border/60 transition-colors last:border-0 hover:bg-elevated/50"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-secondary-foreground',
                    alignClass(col.align),
                    col.className,
                  )}
                >
                  {col.cell(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
