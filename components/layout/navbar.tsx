'use client'

import { Search, Upload, Bell, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import { FileTypeIcon } from "@/components/ui/file-type-icon"
import { NavbarCreditBadge } from "@/components/navbar-credit-badge"

interface SearchResult {
  id: string
  title: string
  subject: string
  fileType: string
  createdAt: string
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}



interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['navbar-search', debouncedSearch],
    queryFn: async () => {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedSearch)}`
      )
      const json = await response.json()
      return json.results as SearchResult[]
    },
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setIsOpen(true)
      }

      if (e.key === 'Escape') {
        setIsOpen(false)
        searchInputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (id: string) => {
    router.push(`/dashboard/notes/${id}`)
    setIsOpen(false)
    setSearchInput('')
  }

  const handleViewAll = () => {
    if (searchInput.trim()) {
      router.push(
        `/dashboard/notes?search=${encodeURIComponent(searchInput)}`
      )
      setIsOpen(false)
    }
  }

  return (
    <header className="navbar-container font-jakarta hidden lg:flex">
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div
          ref={containerRef}
          className="relative min-w-0 flex-1 lg:min-w-[220px] lg:max-w-[290px]"
        >
          <div className="navbar-search-wrapper">
            <Search
              size={14}
              strokeWidth={2}
              className="search-icon"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => {
                if (searchInput.trim().length >= 2) {
                  setIsOpen(true)
                }
              }}
              placeholder="Search notes, subjects, etc..."
              aria-label="Search notes"
              className="navbar-search-input text-[13px] font-normal text-[#101828] placeholder:text-text-secondary flex-1 whitespace-nowrap outline-none bg-transparent"
            />
          <div className="navbar-search-kbd text-[8px] font-medium text-[#344054] hidden sm:flex">
              <kbd className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[11px] bg-transparent border-none">
                Ctrl + K
              </kbd>
            </div>
          </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          >
            {isLoading && !data ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 last:border-none"
                  >
                    <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="h-2.5 bg-gray-100 rounded w-16 animate-pulse" />
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded w-12 animate-pulse" />
                  </div>
                ))}
              </>
            ) : data && data.length > 0 ? (
              <>
                {data.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result.id)}
                    className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 last:border-none hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <FileTypeIcon fileType={result.fileType} title={result.title} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-gray-900 truncate">
                        {result.title}
                      </div>
                      <div className="text-[12px] text-gray-500 truncate">
                        {result.subject}
                      </div>
                    </div>
                    <div className="text-[12px] text-[#344054] whitespace-nowrap shrink-0">
                      {formatRelativeTime(result.createdAt)}
                    </div>
                  </div>
                ))}
                <div
                  onClick={handleViewAll}
                  className="flex items-center justify-center gap-1.5 pt-3 pb-3 px-3 border-t border-gray-100 text-[13px] font-medium text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                >
                  <span>View all results</span>
                  <ArrowRight size={14} />
                </div>
              </>
            ) : (
              <div className="px-3 py-6 text-center text-[13px] text-gray-500">
                No notes found
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Right Section */}
      <div className="navbar-section-right">
        {/* Credits Badge */}
        <NavbarCreditBadge />

        {/* Generate New Button */}
        <Link href="/dashboard/generate" className="navbar-btn-generate navbar-btn-generate-bg">
          <Upload size={18} strokeWidth={2} className="text-white" />
          <span className="text-[13.5px] font-semibold hidden sm:inline">Generate New</span>
        </Link>

        {/* Bell Icon */}
        <button className="navbar-btn-icon hidden sm:flex" aria-label="Notifications">
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
                <button className="navbar-btn-generate navbar-btn-generate-bg">
                  <span className="text-[13.5px] font-semibold">Sign In</span>
                </button>
              </SignInButton>
            ) : (
              <div className="flex items-center gap-3">
                <span className="navbar-user-name text-[13px] hidden md:inline">
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
