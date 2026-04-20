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

interface NavClassOptions {
  active: boolean
  admin?: boolean
}

function navClasses({ active, admin = false }: NavClassOptions) {
  const base =
    'relative text-base px-3 py-2 rounded-lg transition-colors duration-200 ease-snappy focus-visible:outline-none'
  const color = admin
    ? active
      ? 'text-violet-600 dark:text-violet-400 font-semibold'
      : 'text-violet-500 dark:text-violet-400 font-medium hover:text-violet-600 dark:hover:text-violet-300'
    : active
      ? 'text-violet-600 dark:text-violet-400 font-medium'
      : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400'
  return `${base} ${color}`
}

function ActiveUnderline({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-3 right-3 -bottom-[7px] h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300 ease-snappy ${
        show ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50'
      }`}
    />
  )
}

export default function Navbar() {
  const t = useTranslations('nav')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin } = useCurrentUser()

  const scrollToDecks = useCallback(() => {
    const element = document.getElementById('decks')
    if (element) {
      const navbarHeight = 64 // matches the h-16 (4rem) sticky navbar
      const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight
      window.scrollTo({ top, behavior: 'auto' })
      window.history.pushState(null, '', '/#decks')

      // Re-adjust after a short delay in case async content (e.g. announcements)
      // loaded and shifted the layout between the initial calculation and now.
      setTimeout(() => {
        const adjusted = element.getBoundingClientRect().top + window.scrollY - navbarHeight
        if (Math.abs(adjusted - top) > 2) {
          window.scrollTo({ top: adjusted, behavior: 'auto' })
        }
      }, 500)
    }
  }, [])

  const handleDecksClick = useCallback(() => {
    if (pathname === '/') {
      scrollToDecks()
    } else {
      router.push('/')
      const checkAndScroll = () => {
        const element = document.getElementById('decks')
        if (element) {
          setTimeout(() => {
            const navbarHeight = 64
            const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight
            window.scrollTo({ top, behavior: 'auto' })
            window.history.pushState(null, '', '/#decks')
            setTimeout(() => {
              const adjusted = element.getBoundingClientRect().top + window.scrollY - navbarHeight
              if (Math.abs(adjusted - top) > 2) {
                window.scrollTo({ top: adjusted, behavior: 'auto' })
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

  // Close menu on Escape
  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMenuOpen])

  const desktopLinks: { href: '/about' | '/subscribe' | '/qa'; key: 'about' | 'subscribe' | 'qa' }[] = [
    { href: '/about', key: 'about' },
    { href: '/subscribe', key: 'subscribe' },
    { href: '/qa', key: 'qa' },
  ]

  return (
    <nav className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-700/80 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center shrink-0 group" aria-label="TCG Master Guide home">
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-violet-600 dark:group-hover:from-purple-400 dark:group-hover:to-violet-400 transition-all duration-500">
              TCG Master Guide
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* About */}
            <Link href="/about" className={navClasses({ active: pathname === '/about' })}>
              {t('about')}
              <ActiveUnderline show={pathname === '/about'} />
            </Link>
            {/* Subscribe */}
            <Link href="/subscribe" className={navClasses({ active: pathname === '/subscribe' })}>
              {t('subscribe')}
              <ActiveUnderline show={pathname === '/subscribe'} />
            </Link>
            {/* Decks (button — scrolls) */}
            <button onClick={handleDecksClick} className={`${navClasses({ active: pathname === '/' })} cursor-pointer`}>
              {t('decks')}
              <ActiveUnderline show={pathname === '/'} />
            </button>
            {/* Q&A */}
            <Link href="/qa" className={navClasses({ active: pathname === '/qa' })}>
              {t('qa')}
              <ActiveUnderline show={pathname === '/qa'} />
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={navClasses({ active: pathname === '/admin', admin: true })}
              >
                {t('admin')}
                <ActiveUnderline show={pathname === '/admin'} />
              </Link>
            )}
            <div className="w-px h-6 bg-stone-200 dark:bg-slate-700 mx-2" />
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="ml-2 inline-flex items-center gap-2 text-base font-medium bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 ease-snappy cursor-pointer active:scale-[0.98]">
                  {t('signIn')}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="ml-2">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9',
                    },
                  }}
                />
              </div>
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-3.5 py-2 rounded-xl transition-colors duration-200 ease-snappy cursor-pointer active:scale-[0.98] whitespace-nowrap">
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
              onClick={() => setIsMenuOpen((v) => !v)}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 cursor-pointer"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-6 h-6">
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 bg-current transition-transform duration-300 ease-snappy ${
                    isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 bg-current transition-opacity duration-200 ease-snappy ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 bg-current transition-transform duration-300 ease-snappy ${
                    isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-snappy ${
            isMenuOpen ? 'max-h-[32rem] pb-4 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 pt-2">
            {desktopLinks.map(({ href, key }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2.5 px-4 rounded-xl transition-colors duration-200 border-l-2 ${
                    active
                      ? 'text-white bg-violet-500 border-transparent dark:text-violet-400 dark:bg-violet-900/30 dark:border-violet-500 font-medium'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-slate-700/50 border-transparent'
                  }`}
                >
                  {t(key)}
                </Link>
              )
            })}
            <button
              onClick={() => {
                setIsMenuOpen(false)
                setTimeout(handleDecksClick, 350)
              }}
              className={`block w-full text-left py-2.5 px-4 rounded-xl transition-colors duration-200 cursor-pointer border-l-2 ${
                pathname === '/'
                  ? 'text-white bg-violet-500 border-transparent dark:text-violet-400 dark:bg-violet-900/30 dark:border-violet-500 font-medium'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-stone-50 dark:hover:bg-slate-700/50 border-transparent'
              }`}
            >
              {t('decks')}
            </button>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2.5 px-4 rounded-xl font-medium transition-colors duration-200 border-l-2 ${
                  pathname === '/admin'
                    ? 'text-white bg-violet-500 border-transparent dark:text-violet-400 dark:bg-violet-900/30 dark:border-violet-500'
                    : 'text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 border-transparent'
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
