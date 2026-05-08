'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Custom SVG icons matching the image exactly
const HomeIcon = ({ active }: { active?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const GenerateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const NotesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h6v6H4z" />
    <path d="M4 14h6v6H4z" />
    <path d="M14 4h6v6h-6z" />
    <rect x="14" y="14" width="6" height="6" rx="3" />
  </svg>
)

const PricingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l1.5 1.5L12 2l8.5 3.5L22 4" />
    <path d="M12 2v20" />
    <path d="M2 4v16l10 2 10-2V4" />
  </svg>
)

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
  </svg>
)

const CrownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20" />
    <path d="M5 20V10l7-6 7 6v10" />
    <path d="M9 20v-5h6v5" />
  </svg>
)

// Logo icon — graduation cap style
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="#7C3AED" />
    <path d="M14 8L6 12l8 4 8-4-8-4z" fill="white" />
    <path d="M10 13.5v4c0 1.1 1.8 2 4 2s4-.9 4-2v-4" fill="white" fillOpacity="0.85" />
    <line x1="22" y1="12" x2="22" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const navItems = [
  { label: 'Home', href: '/dashboard', icon: HomeIcon },
  { label: 'Generate', href: '/dashboard/generate', icon: GenerateIcon },
  { label: 'My Notes', href: '/dashboard/notes', icon: NotesIcon },
  { label: 'Pricing', href: '/pricing', icon: PricingIcon },
  { label: 'Help & FAQ', href: '/help', icon: HelpIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <aside className="sidebar-container font-jakarta">
      {/* Logo */}
      <div className="sidebar-logo">
        <LogoIcon />
        <span className="sidebar-logo-text">
          ExamPrep AI
        </span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-nav-link',
                active
                  ? 'sidebar-nav-link-active'
                  : 'sidebar-nav-link-inactive'
              )}
              style={{ textDecoration: 'none' }}
            >
              <span className={active ? 'text-[#6D28D9]' : 'text-[#6B7280]'}>
                <Icon active={active} />
              </span>
              <span
                className={active ? 'sidebar-nav-text-active' : 'sidebar-nav-text-inactive'}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Upgrade Card */}
      <div className="sidebar-upgrade-card sidebar-upgrade-card-bg">
        {/* Crown icon top-right */}
        <div className="flex justify-end mb-2">
          <div className="sidebar-upgrade-icon sidebar-upgrade-icon-bg">
            <CrownIcon />
          </div>
        </div>

        <h3 className="sidebar-upgrade-title">
          Upgrade to Pro
        </h3>
        <p className="sidebar-upgrade-text">
          Unlock unlimited uploads, advanced AI, and more powerful features.
        </p>
        <button className="sidebar-upgrade-btn sidebar-upgrade-btn-bg">
          Upgrade Now
        </button>
      </div>
    </aside>
  )
}