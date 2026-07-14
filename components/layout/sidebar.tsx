'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { navItems } from '@/lib/navigation-config'
import {
  Crown,
} from 'lucide-react'

const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path
    d="M31.2 28
       C 31.2 28 22 30 16.5 31.5
       C 13.5 32.3 11.5 33.8 11.5 36.5
       L 11.5 50
       C 11.5 52.6 14 54.4 16.4 53.5
       C 21.5 51.6 28 48.7 30.6 46.5
       C 31.1 46.1 31.2 45.5 31.2 44.8
       Z"
    fill="#5732DC"
  />
  <path
    d="M32.8 28
       C 32.8 28 42 30 47.5 31.5
       C 50.5 32.3 52.5 33.8 52.5 36.5
       L 52.5 50
       C 52.5 52.6 50 54.4 47.6 53.5
       C 42.5 51.6 36 48.7 33.4 46.5
       C 32.9 46.1 32.8 45.5 32.8 44.8
       Z"
    fill="#5732DC"
  />
  <path
    d="M40 36 L 44.3 38.6"
    stroke="#8F76EE"
    strokeWidth="1.5"
    strokeLinecap="round"
  />
  <path
    d="M27.5 23.5 C 23 25.3 20 28.2 18.8 32"
    stroke="#5732DC"
    strokeWidth="1.7"
    strokeLinecap="round"
    fill="none"
  />
  <path
    d="M36.5 23.5 C 41 25.3 44 28.2 45.2 32"
    stroke="#5732DC"
    strokeWidth="1.7"
    strokeLinecap="round"
    fill="none"
  />
  <ellipse cx="32" cy="22" rx="5.4" ry="4.6" fill="#5732DC" />
  <path
    d="M32 8.5
       L 51 18.2
       C 52 18.7 52 20 51 20.5
       L 32.7 27.8
       C 32.3 28 31.7 28 31.3 27.8
       L 13 20.5
       C 12 20 12 18.7 13 18.2
       L 31.3 8.5
       C 31.7 8.3 32.3 8.3 32 8.5 Z"
    fill="#5732DC"
  />
</svg>
)

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <div className="hidden lg:block">
      <aside
        className="sidebar-container d bg-[#FAFBFC] fixed left-0 top-0 z-50 h-screen"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <LogoIcon />
          <span className="sidebar-logo-text text-sm">
            ExamPrep AI
          </span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'sidebar-nav-link',
                  active
                    ? 'sidebar-nav-link-active'
                    : 'sidebar-nav-link-inactive'
                )}
                style={{ textDecoration: 'none' }}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? 'text-[#6D42F5]' : 'text-[#667085]'}
                />
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
        <div className="sidebar-upgrade-card sidebar-upgrade-card-bg flex flex-col items-start justify-start">
          <div className="flex items-start justify-start">
            <div className="sidebar-upgrade-icon">
              <Crown size={16} strokeWidth={2} className="text-brand" />
            </div>
          <h3 className="sidebar-upgrade-title ml-1.2 mt-1.5">
            Upgrade to Pro
          </h3>
          </div>

          <p className="sidebar-upgrade-text">
            Unlock unlimited uploads, advanced AI, and more powerful features.
          </p>
          <Link href="/dashboard/pricing" onClick={onClose} className="sidebar-upgrade-btn sidebar-upgrade-btn-bg text-center" style={{ textDecoration: 'none' }}>
            Upgrade Now
          </Link>
        </div>
      </aside>
    </div>
  )
}
