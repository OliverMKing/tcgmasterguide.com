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
import { LogoMark } from './Logo'

interface NavClassOptions {
  active: boolean
  admin?: boolean
}

function navClasses({ active, admin = false }: NavClassOptions) {
  const base =
    'relative text-[0.95rem] font-semibold px-3 py-2 rounded-lg transition-colors duration-200 ease-snappy'
  const color = active
    ? 'text-ink'
    : admin
      ? 'text-accent-text hover:text-ink'
      : 'text-ink-2 hover:text-ink'
  return `${base} ${color}`
}

function ActiveUnderline({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-3 right-3 bottom-0.5 h-[2px] rounded-full bg-accent transition-transform duration-300 ease-snappy origin-left ${
        show ? 'scale-x-100' : 'scale-x-0'
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

  const desktopLinks: { href: '/posts' | '/about' | '/subscribe' | '/qa'; key: 'posts' | 'about' | 'subscribe' | 'qa' }[] = [
    { href: '/posts', key: 'posts' },
    { href: '/about', key: 'about' },
    { href: '/subscribe', key: 'subscribe' },
    { href: '/qa', key: 'qa' },
  ]

  return (
    <nav className="bg-page/90 backdrop-blur-md border-b border-line sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0 group" aria-label="TCG Master Guide home">
            <LogoMark className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 ease-snappy group-hover:-rotate-6" />
            <span className="font-display font-black text-[1.3rem] min-[400px]:text-[1.45rem] sm:text-[1.7rem] leading-none text-ink whitespace-nowrap">
              TCG Master Guide
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Decks (button — scrolls) */}
            <button onClick={handleDecksClick} className={`${navClasses({ active: pathname === '/' })} cursor-pointer`}>
              {t('decks')}
              <ActiveUnderline show={pathname === '/'} />
            </button>
            {/* Posts */}
            <Link href="/posts" className={navClasses({ active: pathname === '/posts' })}>
              {t('posts')}
              <ActiveUnderline show={pathname === '/posts'} />
            </Link>
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
            <div className="w-px h-6 bg-line mx-2" />
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="ml-2 inline-flex items-center text-[0.95rem] font-semibold bg-accent hover:bg-accent-hover text-accent-ink px-4 py-2 rounded-[10px] transition-colors duration-200 cursor-pointer">
                  {t('signIn')}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="ml-2 flex items-center">
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
          <div className="flex lg:hidden items-center gap-1 min-[400px]:gap-2">
            {/* On very narrow screens the theme toggle moves into the menu */}
            <div className="hidden min-[400px]:block">
              <ThemeToggle />
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-semibold bg-accent hover:bg-accent-hover text-accent-ink px-3 min-[400px]:px-3.5 py-2 rounded-[10px] transition-colors duration-200 cursor-pointer whitespace-nowrap">
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
              className="p-2 text-ink-2 hover:text-ink hover:bg-surface-2 rounded-[10px] transition-colors duration-200 cursor-pointer"
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
            <button
              onClick={() => {
                setIsMenuOpen(false)
                setTimeout(handleDecksClick, 350)
              }}
              className={`block w-full text-left py-2.5 px-4 rounded-r-[10px] transition-colors duration-200 cursor-pointer border-l-2 font-semibold ${
                pathname === '/'
                  ? 'text-ink bg-surface-2 border-accent font-semibold'
                  : 'text-ink-2 hover:text-ink hover:bg-surface-2 border-transparent'
              }`}
            >
              {t('decks')}
            </button>
            {desktopLinks.map(({ href, key }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2.5 px-4 rounded-r-[10px] transition-colors duration-200 border-l-2 font-semibold ${
                    active
                      ? 'text-ink bg-surface-2 border-accent font-semibold'
                      : 'text-ink-2 hover:text-ink hover:bg-surface-2 border-transparent'
                  }`}
                >
                  {t(key)}
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2.5 px-4 rounded-r-[10px] font-semibold transition-colors duration-200 border-l-2 ${
                  pathname === '/admin'
                    ? 'text-ink bg-surface-2 border-accent'
                    : 'text-accent-text hover:text-ink hover:bg-surface-2 border-transparent'
                }`}
              >
                {t('admin')}
              </Link>
            )}
            <div className="min-[400px]:hidden flex items-center px-3 pt-2 mt-2 border-t border-line">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
