'use client'

import { Search, Upload, Bell, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'

export function Navbar() {
  const { user, isLoaded } = useUser()

  return (
    <header className="navbar-container font-jakarta ">
      {/* Search Bar */}
      <div className="navbar-search-wrapper" style={{ minWidth: '220px', maxWidth: '290px', width: '100%' }}>
        <Search
          size={14}
          strokeWidth={2}
          className="search-icon"
        />
        <span className="navbar-search-input text-[13px] font-normal text-gray-400 flex-1 whitespace-nowrap">
          Search notes, subjects, etc...
        </span>
        <div className="navbar-search-kbd text-[8px] font-medium text-gray-400">
          <kbd className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[11px] bg-transparent border-none">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="navbar-section-right">
        {/* Generate New Button */}
        <button className="navbar-btn-generate navbar-btn-generate-bg h-9">
          <Upload size={14} strokeWidth={2.5} className="text-white" />
          <span className="text-[13.5px] font-semibold">Generate New</span>
        </button>

        {/* Bell Icon */}
        <button className="navbar-btn-icon">
          <Bell
            size={18}
            strokeWidth={1.8}
            className="text-gray-500"
          />
        </button>

        {/* Auth Section */}
        {isLoaded && (
          <>
            {!user ? (
              <SignInButton>
                <button className="navbar-btn-generate navbar-btn-generate-bg h-9">
                  <span className="text-[13.5px] font-semibold">Sign In</span>
                </button>
              </SignInButton>
            ) : (
              <div className="flex items-center gap-3">
                <span className="navbar-user-name text-[13px]">
                  {user.firstName || user.username || 'User'}
                </span>
                <UserButton />
              </div>
            )}
          </>
        )}
      </div>
    </header>
  )
}
