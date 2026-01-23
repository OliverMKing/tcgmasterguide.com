'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAdmin } = useCurrentUser()

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-400">
              TCG Master Guide
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden sm:flex items-center space-x-6">
            <Link
              href="/"
              className="text-base text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-base text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/#decks"
              className="text-base text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              Decks
            </Link>
            <Link
              href="/qa"
              className="text-base text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              Q&A
            </Link>
            <Link
              href="/live"
              className="text-base text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              Live
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-base text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
              >
                Admin
              </Link>
            )}
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-base bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-md transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center space-x-3">
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-md transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
            </SignedIn>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMenuOpen && (
          <div className="sm:hidden pb-4 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/#decks"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              Decks
            </Link>
            <Link
              href="/qa"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              Questions and Answers
            </Link>
            <Link
              href="/live"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              Live
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
              >
                Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
