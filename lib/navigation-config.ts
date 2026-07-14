import {
  LayoutDashboard,
  Zap,
  FileText,
  CreditCard,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Generate', href: '/dashboard/generate', icon: Zap },
  { label: 'My Notes', href: '/dashboard/notes', icon: FileText },
  { label: 'Pricing', href: '/dashboard/pricing', icon: CreditCard },
  { label: 'Help & FAQ', href: '/dashboard/help', icon: HelpCircle },
]
