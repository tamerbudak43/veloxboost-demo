'use client'

import Link from 'next/link'
import { FileText, Info } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { UsdtAmount } from '@/components/velox/tether-icon'
import { formatUSDT } from '@/lib/format'
import type { ArbitrageBalance } from '@/lib/types'

function BalanceCard({
  label,
  amount,
  action,
}: {
  label: string
  amount: number
  action: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
          <UsdtAmount value={formatUSDT(amount)} iconClassName="size-[1.1em]" />
        </p>
      </div>
      {action}
    </div>
  )
}

export function BalanceSummary({ balance }: { balance: ArbitrageBalance }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <BalanceCard
        label="Ticaret bakiyesi / Arbitraj"
        amount={balance?.tradingBalance ?? 0}
        action={
          <Link href="/deposit#investment-receipts" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <FileText />
            Faturalar
          </Link>
        }
      />
      <BalanceCard
        label="Gelir bakiyesi"
        amount={balance?.incomeBalance ?? 0}
        action={
          <Button variant="ghost" size="icon-sm" aria-label="Bilgi">
            <Info />
          </Button>
        }
      />
    </div>
  )
}
