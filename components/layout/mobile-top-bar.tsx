'use client'

import { UserButton } from '@clerk/nextjs'
import { NavbarCreditBadge } from '@/components/navbar-credit-badge'

const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M31.2 28 C 31.2 28 22 30 16.5 31.5 C 13.5 32.3 11.5 33.8 11.5 36.5 L 11.5 50 C 11.5 52.6 14 54.4 16.4 53.5 C 21.5 51.6 28 48.7 30.6 46.5 C 31.1 46.1 31.2 45.5 31.2 44.8 Z"
      fill="#5732DC"
    />
    <path
      d="M32.8 28 C 32.8 28 42 30 47.5 31.5 C 50.5 32.3 52.5 33.8 52.5 36.5 L 52.5 50 C 52.5 52.6 50 54.4 47.6 53.5 C 42.5 51.6 36 48.7 33.4 46.5 C 32.9 46.1 32.8 45.5 32.8 44.8 Z"
      fill="#5732DC"
    />
    <path d="M40 36 L 44.3 38.6" stroke="#8F76EE" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M27.5 23.5 C 23 25.3 20 28.2 18.8 32" stroke="#5732DC" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    <path d="M36.5 23.5 C 41 25.3 44 28.2 45.2 32" stroke="#5732DC" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    <ellipse cx="32" cy="22" rx="5.4" ry="4.6" fill="#5732DC" />
    <path
      d="M32 8.5 L 51 18.2 C 52 18.7 52 20 51 20.5 L 32.7 27.8 C 32.3 28 31.7 28 31.3 27.8 L 13 20.5 C 12 20 12 18.7 13 18.2 L 31.3 8.5 C 31.7 8.3 32.3 8.3 32 8.5 Z"
      fill="#5732DC"
    />
  </svg>
)

export function MobileTopBar() {
  return (
    <header className="mobile-top-bar">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <LogoIcon />
        <span className="text-[15px] font-bold text-[#101828] tracking-tight">
          ExamPrepAI
        </span>
      </div>

      {/* Right section: Credits + Avatar */}
      <div className="flex items-center gap-2.5">
        <NavbarCreditBadge />
        <div className="flex items-center justify-center w-9 h-9">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
