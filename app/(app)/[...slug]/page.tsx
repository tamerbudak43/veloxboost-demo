import { ComingSoon } from '@/components/velox/coming-soon'
import { navSections } from '@/lib/nav'

// Map each nav route to the phase it belongs to (for messaging only).
const phaseByHref: Record<string, string> = {
  '/contracts': 'Aşama 2',
  '/my-contracts': 'Aşama 2',
  '/investor-statistics': 'Aşama 2',
  '/deposit': 'Aşama 2',
  '/withdraw': 'Aşama 2',
  '/auto-withdraw': 'Aşama 2',
  '/partners': 'Aşama 3',
  '/partner-program': 'Aşama 3',
  '/marketing-statistics': 'Aşama 3',
  '/career': 'Aşama 4',
  '/ranks': 'Aşama 4',
  '/partner-challenge': 'Aşama 4',
  '/partner-boost': 'Aşama 4',
  '/liquidity': 'Aşama 2',
  '/pool-percentage': 'Aşama 2',
  '/reports': 'Aşama 2',
  '/documents': 'Aşama 2',
}

function labelFor(path: string): string {
  for (const section of navSections) {
    const found = section.items.find((i) => i.href === path)
    if (found) return found.label
  }
  // fallback: prettify the slug
  const last = path.split('/').filter(Boolean).pop() ?? 'Sayfa'
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const path = '/' + (Array.isArray(slug) ? slug.join('/') : '')

  if (path === '/logout') {
    return (
      <ComingSoon title="Çıkış Yap" phase="Kimlik doğrulama entegrasyonu" />
    )
  }

  return <ComingSoon title={labelFor(path)} phase={phaseByHref[path]} />
}
