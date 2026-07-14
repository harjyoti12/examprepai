'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { navItems } from '@/lib/navigation-config'

export function MobileBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))

  return (
    <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'mobile-bottom-nav-item',
                active && 'mobile-bottom-nav-item-active'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <div className="mobile-bottom-nav-icon">
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {active && <div className="mobile-bottom-nav-indicator" />}
              </div>
              <span className="mobile-bottom-nav-label">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
