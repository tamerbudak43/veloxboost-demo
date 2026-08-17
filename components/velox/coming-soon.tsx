import Link from 'next/link'
import { ArrowLeft, Hammer } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/velox/primitives'
import { cn } from '@/lib/utils'

export function ComingSoon({
  title,
  phase,
}: {
  title: string
  phase?: string
}) {
  return (
    <div>
      <PageHeader
        title={title}
        description="Bu bölüm VELOX platformunun ilerleyen aşamasında etkinleştirilecek."
      />
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card px-6 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-elevated text-bright">
          <Hammer className="size-5" />
        </div>
        <p className="text-base font-semibold text-foreground">Yakında</p>
        <p className="max-w-sm text-sm text-muted-foreground text-pretty">
          {phase ? `${phase} kapsamında yayına alınacak.` : 'Bu modül yapım aşamasında.'} Arayüz
          ve veri mimarisi hazırlanıyor.
        </p>
        <Link
          href="/arbitraj"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-2')}
        >
          <ArrowLeft />
          Arbitraj terminaline dön
        </Link>
      </div>
    </div>
  )
}
