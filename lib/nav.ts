import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Award,
  BadgeCheck,
  BarChart3,
  Bot,
  Boxes,
  CircleHelp,
  Droplets,
  FileText,
  Files,
  FolderOpen,
  Gauge,
  House,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Megaphone,
  Network,
  Percent,
  Rocket,
  ScrollText,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: 'NAVİGASYON — PANEL',
    items: [
      { label: 'Ana Panel', href: '/dashboard', icon: House },
      { label: 'Arbitraj', href: '/arbitraj', icon: ArrowLeftRight },
      { label: 'Arbitraj Pro', href: '/arbitraj-pro', icon: Gauge },
      { label: 'Arbitraj Havuzları', href: '/arbitraj-havuzlari', icon: Boxes },
      { label: 'Txid OneTrade', href: '/velox-trade', icon: Bot },
      { label: 'Likidite', href: '/liquidity', icon: Droplets },
      { label: 'Havuz Yüzdesi', href: '/pool-percentage', icon: Percent },
      { label: 'Sözleşme', href: '/my-contracts', icon: FileText },
    ],
  },
  {
    title: 'NAVİGASYON — KONTROL',
    items: [
      { label: 'Rapor', href: '/reports', icon: BarChart3 },
      { label: 'Belgeler', href: '/documents', icon: FolderOpen },
      { label: 'Tüm Sözleşmeler', href: '/contracts', icon: ScrollText },
      { label: 'Sözleşmelerim', href: '/contract-portfolio', icon: Files },
      { label: 'Yatırımcı İstatistiği', href: '/investor-statistics', icon: TrendingUp },
      { label: 'Pazarlama İstatistiği', href: '/marketing-statistics', icon: Megaphone },
      { label: 'Gelişim Planı', href: '/career', icon: Target },
      { label: 'VELOX Grup Ürünleri', href: '/products', icon: LayoutGrid },
    ],
  },
  {
    title: 'AĞ',
    items: [
      { label: 'Partner Programı', href: '/partner-program', icon: Users },
      { label: 'Partner Challenge', href: '/partner-challenge', icon: Trophy },
      { label: 'Partner Boost', href: '/partner-boost', icon: Rocket },
      { label: 'Ağ Programı', href: '/partners', icon: Network },
      { label: 'Rütbeler ve Yeterlilik', href: '/ranks', icon: Award },
    ],
  },
  {
    title: 'HESAP',
    items: [
      { label: 'KYC Doğrulama', href: '/kyc', icon: BadgeCheck },
      { label: 'Hesap Ayarları', href: '/settings', icon: Settings },
      { label: 'SSS', href: '/faq', icon: CircleHelp },
      { label: 'Yardım', href: '/help', icon: LifeBuoy },
      { label: 'Çıkış Yap', href: '/logout', icon: LogOut },
    ],
  },
]

// Icons re-exported for reuse elsewhere (top nav, etc.)
export { BadgeCheck, Sparkles }
