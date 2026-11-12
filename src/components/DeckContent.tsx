'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { LockedDeckContent } from '@/components/LockedDeckContent'
import { MarkdownContent } from '@/components/MarkdownContent'
import { ViewHistoryButton } from '@/components/ViewHistoryButton'
import Image from 'next/image'
import { getPokemonSprite } from '@/components/DeckCard'
import Comments from '@/components/Comments'
import { HistoryEntry } from '@/generated/deck-history'
import { useHolo } from '@/hooks/useHolo'
import { useFetchWithRetry } from '@/lib/fetch-with-retry'
import { PREMIUM_PLACEHOLDER } from '@/lib/content-visibility'
import { Skeleton, ReadingProgress } from '@/components/ui'

interface TocItem {
  id: string
  text: string
  level: number
}

interface DeckContentProps {
  slug: string
  title: string
  headings: TocItem[]
  /** Where "Back to decks" goes: this deck's tier on the home page. */
  backHref?: string
}

// Retry config for subscription propagation delays
const ACCESS_RETRY_COUNT = 3
const ACCESS_RETRY_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function createIdGenerator(): (text: string) => string {
  const idCounts: Record<string, number> = {}
  return (text: string) => {
    const baseId = slugify(text)
    if (idCounts[baseId] === undefined) {
      idCounts[baseId] = 0
      return baseId
    } else {
      idCounts[baseId]++
      return `${baseId}-${idCounts[baseId]}`
    }
  }
}

function extractHeadingsFromContent(content: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const headings: TocItem[] = []
  const generateId = createIdGenerator()
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
    const id = generateId(text)
    headings.push({ id, text, level })
  }

  return headings
}


/* ------------------------------------------------------------------
   Access state, shared with the page header.
   The header is rendered on the server, but whether the reader has access
   is only known after DeckContent fetches the guide. The header's
   "View history" control reads it from this context.
   ------------------------------------------------------------------ */

interface DeckAccessState {
  hasAccess: boolean | null
  setHasAccess: (value: boolean | null) => void
}

const DeckAccessContext = createContext<DeckAccessState | null>(null)

export function DeckAccessProvider({ children }: { children: ReactNode }) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const value = useMemo(() => ({ hasAccess, setHasAccess }), [hasAccess])
  return <DeckAccessContext.Provider value={value}>{children}</DeckAccessContext.Provider>
}

/** A shimmering placeholder for text on the playmat, sized by className. */
export function MatSkeleton({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block overflow-hidden rounded-full bg-mat-ink/15 align-middle ${className}`}
    >
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-mat-ink/20 to-transparent" />
    </span>
  )
}

/** "View history" for the page header. Only subscribers see the revision history. */
export function DeckHistoryControl({ history, deckTitle }: { history: HistoryEntry[]; deckTitle: string }) {
  const access = useContext(DeckAccessContext)
  if (history.length === 0) return null
  // Access is unknown until the guide loads: hold the space with a placeholder.
  if (access?.hasAccess === null) return <MatSkeleton className="h-4 w-[6.75rem]" />
  if (!access?.hasAccess) return null
  return <ViewHistoryButton history={history} deckTitle={deckTitle} tone="mat" />
}

/* ------------------------------------------------------------------
   The deck as a trading card, for the page header. Same face as DeckCard,
   but not a link. Every deck card is a holo.
   ------------------------------------------------------------------ */

const spriteLayout: { width: number; overlap: number }[] = [
  { width: 96, overlap: 0 },
  { width: 66, overlap: 22 },
  { width: 52, overlap: 18 },
]

export function DeckGuideCard({
  title,
  pokemon,
  footer,
  holo = true,
  tier,
  className = '',
}: {
  title: string
  pokemon: number[]
  footer?: string
  holo?: boolean
  /** Picks the foil metal: 1 gold, 2 silver, 3 copper, 4 lavender. */
  tier?: number
  className?: string
}) {
  const { ref, onPointerMove, onPointerLeave } = useHolo<HTMLDivElement>(holo ? 12 : 0)
  const count = Math.min(pokemon.length, 3) || 1
  const layout = spriteLayout[count - 1]
  const [first, ...rest] = title.split(' / ')

  return (
    <div aria-hidden="true" className={className}>
      <div
        ref={ref}
        onPointerMove={holo ? onPointerMove : undefined}
        onPointerLeave={holo ? onPointerLeave : undefined}
        className={`tcg-card ${holo ? `holo ${tier ? `foil-tier-${tier}` : ''}` : ''}`}
      >
        <div className="tcg-card-face">
          <div className="font-display font-extrabold text-card-ink leading-[0.92] px-2.5 pt-2 pb-1.5 text-[1.15rem] sm:px-3.5 sm:pt-3 sm:pb-2.5 sm:text-[1.75rem]">
            {first}
            {rest.length > 0 && (
              <span className="block text-card-ink-2 whitespace-nowrap">/ {rest.join(' / ')}</span>
            )}
          </div>
          <div className="tcg-card-art flex-1 flex items-center justify-center overflow-hidden">
            {pokemon.slice(0, 3).map((id, i) => (
              <Image
                key={id}
                src={getPokemonSprite(id)}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="sprite shrink-0 h-auto max-w-none object-contain"
                style={{ width: `${layout.width}%`, marginLeft: i === 0 ? 0 : `-${layout.overlap}%` }}
              />
            ))}
          </div>
          <div className="text-card-ink-2 px-2.5 py-2 text-[0.72rem] sm:px-3.5 sm:py-2.5 sm:text-sm leading-tight min-h-[1.5em] whitespace-nowrap overflow-hidden text-ellipsis">
            {footer}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   Table of contents
   ------------------------------------------------------------------ */

// The heading whose top has passed this line (in px from the viewport top) is the current one.
const ACTIVE_LINE = 140

function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')

  useEffect(() => {
    const list = key ? key.split('|') : []
    if (list.length === 0) return
    let frame = 0
    const update = () => {
      frame = 0
      let current: string | null = null
      for (const id of list) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top - ACTIVE_LINE <= 0) current = id
        else break
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    // Headings render after the guide loads, so watch them with an IntersectionObserver
    // as well as on scroll. The observer catches jumps from TOC links and resizes.
    const observer = new IntersectionObserver(onScroll, { rootMargin: `-${ACTIVE_LINE}px 0px 0px 0px` })
    for (const id of list) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key])

  return active
}

interface TocListProps {
  headings: TocItem[]
  activeId: string | null
  showDiscussion: boolean
  discussionLabel: string
  onNavigate?: () => void
}

function TocList({ headings, activeId, showDiscussion, discussionLabel, onNavigate }: TocListProps) {
  const minLevel = headings.length > 0 ? Math.min(...headings.map((h) => h.level)) : 1
  const items = [
    ...headings.map((h) => ({ id: h.id, text: h.text, depth: h.level - minLevel })),
    ...(showDiscussion ? [{ id: 'discussion', text: discussionLabel, depth: 0 }] : []),
  ]

  return (
    <ul className="border-l border-line">
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              aria-current={isActive ? 'location' : undefined}
              className={`-ml-px block border-l-2 py-1.5 pr-2 leading-snug transition-colors ${
                item.depth === 0 ? 'text-[0.9375rem] font-semibold' : 'text-sm'
              } ${
                isActive
                  ? 'border-accent text-ink'
                  : `border-transparent hover:text-ink ${item.depth === 0 ? 'text-ink-2' : 'text-ink-3'}`
              }`}
              style={{ paddingLeft: `${0.875 + item.depth * 0.875}rem` }}
            >
              {item.text}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function LockedTocTeaser({ hidden, label, moreLabel }: { hidden: TocItem[]; label: string; moreLabel: string | null }) {
  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-ink-2 mb-2">{label}</p>
      <ul className="space-y-1.5">
        {hidden.slice(0, 4).map((heading) => (
          <li key={heading.id} className="flex items-start gap-2 text-sm leading-snug text-ink-3">
            <svg className="mt-[0.15em] w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path strokeLinecap="round" d="M8 11V8a4 4 0 018 0v3" />
            </svg>
            <span>{heading.text}</span>
          </li>
        ))}
      </ul>
      {moreLabel && <p className="mt-2 pl-[1.375rem] text-sm text-ink-3">{moreLabel}</p>}
    </div>
  )
}

/** The row at the end of a guide that leads back to the deck's tier on the home page. */
function MoreGuides({ backHref }: { backHref: string }) {
  const t = useTranslations('deck')
  return (
    <div className="mt-20 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display font-black text-4xl leading-none text-ink">{t('exploreMoreGuides')}</h2>
        <p className="mt-2 text-ink-2">{t('continueJourney')}</p>
      </div>
      <Link
        href={backHref}
        className="inline-flex shrink-0 items-center self-start rounded-[10px] border border-line-strong px-4 py-2.5 font-semibold text-ink transition-colors hover:border-ink sm:self-auto"
      >
        {t('browseAllDecks')}
      </Link>
    </div>
  )
}

export function DeckContent({ slug, title, headings, backHref = '/#decks' }: DeckContentProps) {
  const t = useTranslations('deck')
  const access = useContext(DeckAccessContext)
  const reportAccess = access?.setHasAccess
  const locale = useLocale()
  const [content, setContent] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchWithRetry = useFetchWithRetry()
  const fetchWithRetryRef = useRef(fetchWithRetry)
  fetchWithRetryRef.current = fetchWithRetry

  useEffect(() => {
    async function fetchContent() {
      try {
        // Force token refresh before fetching to ensure subscriber status is current
        let res = await fetchWithRetryRef.current(`/api/decks/${slug}/content?locale=${locale}`, { forceRefresh: true })
        let data = await res.json()

        // If user doesn't have access, retry a few times in case subscription
        // webhook hasn't propagated yet (e.g., just subscribed)
        if (res.ok && !data.hasAccess) {
          for (let attempt = 0; attempt < ACCESS_RETRY_COUNT; attempt++) {
            await sleep(ACCESS_RETRY_DELAY_MS)
            res = await fetchWithRetryRef.current(`/api/decks/${slug}/content?locale=${locale}`, { forceRefresh: true })
            data = await res.json()
            if (data.hasAccess) break
          }
        }

        if (res.ok) {
          setContent(data.content)
          setHasAccess(data.hasAccess)
        } else {
          setHasAccess(false)
        }
      } catch (error) {
        console.error('Failed to fetch deck content:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [slug, locale])

  useEffect(() => {
    reportAccess?.(hasAccess)
  }, [hasAccess, reportAccess])

  // For non-subscribers, extract headings only from the content they can see
  const visibleHeadings = useMemo(
    () => (hasAccess || !content ? headings : extractHeadingsFromContent(content)),
    [hasAccess, content, headings]
  )
  const activeId = useActiveHeading(
    loading ? [] : [...visibleHeadings.map((h) => h.id), ...(hasAccess ? ['discussion'] : [])]
  )
  const tocScrollRef = useRef<HTMLDivElement>(null)
  const mobileTocRef = useRef<HTMLDetailsElement>(null)

  // Keep the current item visible inside the sticky table of contents.
  useEffect(() => {
    const box = tocScrollRef.current
    if (!box || !activeId) return
    const link = box.querySelector<HTMLElement>(`a[href="#${CSS.escape(activeId)}"]`)
    if (!link) return
    const top = link.offsetTop - box.offsetTop
    if (top < box.scrollTop + 40 || top > box.scrollTop + box.clientHeight - 80) {
      box.scrollTo({ top: Math.max(0, top - box.clientHeight / 3) })
    }
  }, [activeId])

  if (loading) {
    return (
      <div
        className="lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-14 xl:gap-20"
        aria-busy="true"
        aria-label={t('loadingGuide')}
      >
        <div className="hidden lg:block space-y-3 pt-1">
          <Skeleton className="h-5 w-24 mb-5" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28 ml-4" />
          <Skeleton className="h-4 w-32 ml-4" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24 ml-4" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="max-w-[68ch] space-y-4">
          <Skeleton className="h-12 w-full lg:hidden mb-8" rounded="2xl" />
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-64 w-full" rounded="2xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  // Check if content is only a premium placeholder (no public content at all)
  const isFullyLocked = !hasAccess && content?.trim() === PREMIUM_PLACEHOLDER

  if (isFullyLocked || !content) {
    return (
      <div className="max-w-[68ch]">
        <LockedDeckContent title={title} headings={headings} />
        <MoreGuides backHref={backHref} />
      </div>
    )
  }

  const tocTitle = hasAccess ? t('tableOfContents') : t('previewContents')
  const hiddenHeadings = (() => {
    if (hasAccess) return []
    const visibleTexts = new Set(visibleHeadings.map((h) => h.text))
    return headings.filter((h) => !visibleTexts.has(h.text))
  })()
  const moreLabel = hiddenHeadings.length > 4 ? t('moreSections', { count: hiddenHeadings.length - 4 }) : null
  const hasToc = visibleHeadings.length > 0

  const tocBody = (onNavigate?: () => void) => (
    <>
      <TocList
        headings={visibleHeadings}
        activeId={activeId}
        showDiscussion={!!hasAccess}
        discussionLabel={t('discussion')}
        onNavigate={onNavigate}
      />
      {hiddenHeadings.length > 0 && (
        <LockedTocTeaser hidden={hiddenHeadings} label={t('fullGuideIncludes')} moreLabel={moreLabel} />
      )}
    </>
  )

  return (
    <>
      <ReadingProgress />
      <div className={hasToc ? 'lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-14 xl:gap-20' : ''}>
        {/* Table of contents: a sticky column on large screens */}
        {hasToc && (
          <nav aria-label={tocTitle} className="hidden lg:block">
            <div
              ref={tocScrollRef}
              className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain pb-8 pr-1"
            >
              <p className="font-display font-extrabold text-2xl leading-none text-ink mb-4">{tocTitle}</p>
              {tocBody()}
            </div>
          </nav>
        )}

        <div className="min-w-0 max-w-[68ch]">
          {/* Free preview note for non-subscribers */}
          {!hasAccess && (
            <div className="mb-10 flex gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 sm:px-5 text-[0.9375rem] leading-relaxed text-ink-2">
              <svg className="mt-[0.2em] w-[1.1rem] h-[1.1rem] shrink-0 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p>
                <strong className="font-bold text-ink">{t('freePreview')}</strong> {t('limitedPreview')}{' '}
                <Link
                  href="/subscribe"
                  className="font-semibold text-accent-text underline decoration-1 underline-offset-[3px] hover:decoration-2"
                >
                  {t('subscribeForAccess')}
                </Link>{' '}
                {t('forFullAccess')}
              </p>
            </div>
          )}

          {/* Table of contents: a disclosure above the article on small screens */}
          {hasToc && (
            <details ref={mobileTocRef} className="group lg:hidden mb-10 rounded-2xl border border-line bg-surface">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                <span className="font-display font-extrabold text-2xl leading-none text-ink">{tocTitle}</span>
                <svg
                  className="w-5 h-5 shrink-0 text-ink-3 transition-transform duration-200 ease-snappy group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <nav aria-label={tocTitle} className="border-t border-line px-4 pt-3 pb-4">
                {tocBody(() => {
                  if (mobileTocRef.current) mobileTocRef.current.open = false
                })}
              </nav>
            </details>
          )}

          {/* Article */}
          <div className="guide-prose">
            <MarkdownContent content={content} />
          </div>

          <MoreGuides backHref={backHref} />

          <Comments deckSlug={slug} deckTitle={title} />
        </div>
      </div>
    </>
  )
}
