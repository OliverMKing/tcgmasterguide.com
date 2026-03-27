'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { ThemeToggle } from './ThemeToggle'
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function Navbar() {
  const t = useTranslations('nav')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, hasSubscriberAccess } = useCurrentUser()

  const scrollToDecks = useCallback(() => {
    const element = document.getElementById('decks')
    if (element) {
      const navbarHeight = 64 // matches the h-16 (4rem) sticky navbar
      const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight
      window.scrollTo({ top, behavior: 'smooth' })
      window.history.pushState(null, '', '/#decks')

      // Re-adjust after a short delay in case async content (e.g. announcements)
      // loaded and shifted the layout between the initial calculation and now.
      setTimeout(() => {
        const adjusted = element.getBoundingClientRect().top + window.scrollY - navbarHeight
        if (Math.abs(adjusted - top) > 2) {
          window.scrollTo({ top: adjusted, behavior: 'smooth' })
        }
      }, 500)
    }
  }, [])

  const handleDecksClick = useCallback(() => {
    if (pathname === '/') {
      // Already on the homepage — scroll to decks section
      scrollToDecks()
    } else {
      // Navigate to homepage, then scroll to decks after page loads
      router.push('/')
      // Wait for navigation to complete, then scroll
      const checkAndScroll = () => {
        const element = document.getElementById('decks')
        if (element) {
          // Delay to allow async content (announcements) to load and settle
          setTimeout(() => {
            const navbarHeight = 64
            const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight
            window.scrollTo({ top, behavior: 'smooth' })
            window.history.pushState(null, '', '/#decks')

            // Re-adjust after async content settles
            setTimeout(() => {
              const adjusted = element.getBoundingClientRect().top + window.scrollY - navbarHeight
              if (Math.abs(adjusted - top) > 2) {
                window.scrollTo({ top: adjusted, behavior: 'smooth' })
              }
            }, 500)
          }, 100)
        } else {
          requestAnimationFrame(checkAndScroll)
        }
      }
      requestAnimationFrame(checkAndScroll)
    }
  }, [pathname, router, scrollToDecks])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <nav className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-stone-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center shrink-0 group">
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-violet-600 dark:group-hover:from-purple-400 dark:group-hover:to-violet-400 transition-all duration-500">
              TCG Master Guide
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/about"
              className={`relative text-base px-4 py-2 rounded-xl transition-all duration-200 ${
                pathname === '/about'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              {t('about')}
            </Link>
            <Link
              href="/subscribe"
              className={`relative text-base px-4 py-2 rounded-xl transition-all duration-200 ${
                pathname === '/subscribe'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              {t('subscribe')}
            </Link>
            <button
              onClick={handleDecksClick}
              className="relative text-base text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-neutral-700/50 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer"
            >
              {t('decks')}
            </button>
            <Link
              href="/qa"
              className={`relative text-base px-4 py-2 rounded-xl transition-all duration-200 ${
                pathname === '/qa'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              {t('qa')}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`relative text-base px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  pathname === '/admin'
                    ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                    : 'text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30'
                }`}
              >
                {t('admin')}
              </Link>
            )}
            <div className="w-px h-6 bg-stone-200 dark:bg-neutral-700 mx-2" />
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-base bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-4 py-1.5 rounded-xl transition-all duration-300 cursor-pointer shadow-md shadow-violet-500/15 hover:shadow-lg hover:shadow-violet-500/25 ml-2">
                  {t('signIn')}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-3">
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-3 py-1.5 rounded-xl transition-all duration-300 cursor-pointer shadow-md shadow-violet-500/15 whitespace-nowrap">
                  {t('signIn')}
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
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 cursor-pointer"
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
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[32rem] pb-4' : 'max-h-0'}`}>
          <div className="space-y-1 pt-2">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2.5 px-4 rounded-xl transition-all duration-200 ${
                pathname === '/'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              {t('home')}
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2.5 px-4 rounded-xl transition-all duration-200 ${
                pathname === '/about'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              {t('about')}
            </Link>
            <Link
              href="/subscribe"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2.5 px-4 rounded-xl transition-all duration-200 ${
                pathname === '/subscribe'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              {t('subscribe')}
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false)
                // Wait for menu collapse animation (300ms transition) before scrolling
                setTimeout(handleDecksClick, 350)
              }}
              className="block w-full text-left py-2.5 px-4 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-neutral-700/50 transition-all duration-200 cursor-pointer"
            >
              {t('decks')}
            </button>
            <Link
              href="/qa"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2.5 px-4 rounded-xl transition-all duration-200 ${
                pathname === '/qa'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              {t('qa')}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${
                  pathname === '/admin'
                    ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                    : 'text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30'
                }`}
              >
                {t('admin')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
