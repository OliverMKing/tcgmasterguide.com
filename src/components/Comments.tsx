'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useFetchWithRetry } from '@/lib/fetch-with-retry'
import { Skeleton, Button } from '@/components/ui'

interface Reply {
  id: string
  content: string
  userName: string
  userId: string
  approved: boolean
  createdAt: string
}

interface Comment {
  id: string
  content: string
  userName: string
  userId: string
  approved: boolean
  createdAt: string
  replies: Reply[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface CommentsProps {
  deckSlug: string
  deckTitle: string
}

type SortField = 'createdAt' | 'userName'
type SortOrder = 'asc' | 'desc'

const MAX_LENGTH = 2000

function formatRelative(iso: string, locale: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = (now - then) / 1000 // seconds

  const rtf = new Intl.RelativeTimeFormat(locale === 'es' ? 'es' : 'en', { numeric: 'auto' })

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ]
  let value = diff
  for (const d of divisions) {
    if (Math.abs(value) < d.amount) {
      return rtf.format(-Math.round(value), d.unit)
    }
    value /= d.amount
  }
  return ''
}

function formatAbsolute(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CharacterMeter({ length }: { length: number }) {
  const pct = Math.min(100, (length / MAX_LENGTH) * 100)
  const near = length > MAX_LENGTH * 0.9
  const over = length >= MAX_LENGTH
  const color = over
    ? 'bg-red-500'
    : near
      ? 'bg-amber-500'
      : 'bg-violet-500'
  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <div className="h-1.5 flex-1 max-w-[140px] bg-stone-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs tabular-nums ${
          over ? 'text-red-500' : near ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400 dark:text-slate-500'
        }`}
      >
        {length}/{MAX_LENGTH}
      </span>
    </div>
  )
}

function Pager({
  page,
  totalPages,
  onChange,
  labels,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
  labels: { previous: string; next: string }
}) {
  // Build compact page list: always show first, last, current, ±1 around current, with ellipses
  const pages: (number | 'ellipsis')[] = []
  const push = (p: number | 'ellipsis') => pages.push(p)
  const include = new Set<number>()
  include.add(1)
  include.add(totalPages)
  include.add(page)
  if (page - 1 >= 1) include.add(page - 1)
  if (page + 1 <= totalPages) include.add(page + 1)
  const sorted = Array.from(include).sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    push(sorted[i])
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) push('ellipsis')
  }

  const baseBtn =
    'min-w-9 h-9 px-3 inline-flex items-center justify-center text-sm rounded-lg border transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${baseBtn} border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-600 dark:text-slate-300 hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="sr-only">{labels.previous}</span>
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-sm text-neutral-400 dark:text-slate-500" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${baseBtn} ${
              p === page
                ? 'border-transparent bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                : 'border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-600 dark:text-slate-300 hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={`${baseBtn} border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-600 dark:text-slate-300 hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="sr-only">{labels.next}</span>
      </button>
    </nav>
  )
}

export default function Comments({ deckSlug, deckTitle }: CommentsProps) {
  const t = useTranslations('comments')
  const locale = useLocale()
  const { isSignedIn, isLoaded } = useUser()
  const { isAdmin, hasSubscriberAccess, isLoaded: userLoaded } = useCurrentUser()
  const fetchWithRetry = useFetchWithRetry()
  const fetchWithRetryRef = useRef(fetchWithRetry)
  fetchWithRetryRef.current = fetchWithRetry
  const [comments, setComments] = useState<Comment[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const fetchComments = useCallback(
    async (page = 1, sort: SortField = 'createdAt', order: SortOrder = 'desc') => {
      try {
        const response = await fetchWithRetryRef.current(
          `/api/comments?deckSlug=${deckSlug}&page=${page}&sortBy=${sort}&sortOrder=${order}`,
          { forceRefresh: true }
        )
        if (!response.ok) throw new Error('Failed to fetch comments')
        const data = await response.json()
        setComments(data.comments)
        setPagination(data.pagination)
      } catch {
        setError('Failed to load comments')
      } finally {
        setIsLoading(false)
      }
    },
    [deckSlug]
  )

  useEffect(() => {
    fetchComments(1, sortBy, sortOrder)
  }, [fetchComments, sortBy, sortOrder])

  const handlePageChange = (page: number) => {
    fetchComments(page, sortBy, sortOrder)
  }

  const handleSortChange = (field: SortField) => {
    if (field === sortBy) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      setSortOrder(newOrder)
      fetchComments(1, field, newOrder)
    } else {
      setSortBy(field)
      setSortOrder('desc')
      fetchComments(1, field, 'desc')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetchWithRetryRef.current('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckSlug, deckTitle, content: newComment }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post comment')
      }

      const comment = await response.json()
      setComments((prev) => [{ ...comment, replies: [] }, ...prev])
      setNewComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmittingReply) return

    setIsSubmittingReply(true)
    setError(null)

    try {
      const response = await fetchWithRetryRef.current('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          parentId,
          deckSlug,
          deckTitle,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post reply')
      }

      const reply = await response.json()
      setComments((prev) =>
        prev.map((c) => (c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c))
      )
      setReplyContent('')
      setReplyingTo(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleDelete = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!confirm('Are you sure you want to delete this?')) return

    try {
      const response = await fetchWithRetryRef.current(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) } : c
          )
        )
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch {
      setError('Failed to delete')
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      const response = await fetchWithRetryRef.current(
        `/api/admin/comments/${commentId}/approve`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved: true }),
        }
      )

      if (!response.ok) throw new Error('Failed to approve comment')

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, approved: true } : c))
      )
    } catch {
      setError('Failed to approve comment')
    }
  }

  return (
    <div
      id="discussion"
      className="mt-16 border-t border-slate-200 dark:border-slate-700 pt-12 scroll-mt-20"
    >
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.7 9.7 0 01-4-.8L3 20l1.3-3.9A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </span>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100">
            {t('title')}
            {hasSubscriberAccess && pagination && pagination.total > 0 && (
              <span className="ml-2 text-sm font-semibold text-neutral-400 dark:text-slate-500 align-middle">
                {pagination.total}
              </span>
            )}
          </h2>
        </div>
        {hasSubscriberAccess && pagination && pagination.total > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-slate-400">{t('sort')}</span>
            <button
              onClick={() => handleSortChange('createdAt')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                sortBy === 'createdAt'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                  : 'bg-stone-100 dark:bg-slate-700 text-neutral-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-600'
              }`}
            >
              {t('date')} {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        )}
      </div>

      {/* Subscriber Gate */}
      {isLoaded && userLoaded && !hasSubscriberAccess && (
        <div className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/80 border border-violet-100 dark:border-slate-700 text-center shadow-sm">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-300/25 dark:bg-violet-500/15 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-300/25 dark:bg-purple-500/15 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white flex items-center justify-center">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-slate-100 mb-2">
              {t('subscriberOnly')}
            </h3>
            <p className="text-neutral-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {t('subscriberOnlyMessage')}
            </p>
            {isSignedIn ? (
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium rounded-xl transition-colors duration-200 ease-snappy active:scale-[0.98]"
              >
                {t('subscribeNow')}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium rounded-xl transition-colors duration-200 ease-snappy active:scale-[0.98] cursor-pointer">
                  {t('signIn')}
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {(!isLoaded || !userLoaded) && (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-32 w-full mb-3" rounded="xl" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-32" rounded="xl" />
            </div>
          </div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content - Only for Subscribers */}
      {isLoaded && userLoaded && hasSubscriberAccess && (
        <>
          {/* Comment Form */}
          {isLoaded && (
            <div className="mb-8">
              {isSignedIn ? (
                <form onSubmit={handleSubmit}>
                  <div className="relative rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/30 transition-all">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t('placeholder')}
                      className="w-full p-4 bg-transparent text-neutral-800 dark:text-slate-100 placeholder-neutral-400 dark:placeholder-slate-500 resize-none rounded-2xl outline-none"
                      rows={4}
                      maxLength={MAX_LENGTH}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 gap-4">
                    <CharacterMeter length={newComment.length} />
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={isSubmitting}
                      disabled={!newComment.trim() || isSubmitting}
                    >
                      {isSubmitting ? t('posting') : t('postComment')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 text-center">
                  <p className="text-neutral-600 dark:text-slate-300 mb-4">{t('signInToComment')}</p>
                  <SignInButton mode="modal">
                    <button className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium rounded-xl transition-colors duration-200 ease-snappy cursor-pointer active:scale-[0.98]">
                      {t('signIn')}
                    </button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}

          {error && !replyingTo && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 text-red-600 dark:text-red-400 flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93a10 10 0 1014.14 14.14A10 10 0 004.93 4.93z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center border border-dashed border-stone-200 dark:border-slate-700 rounded-2xl bg-stone-50/50 dark:bg-slate-800/30 py-12 px-6">
              <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h10M5 20l-2 2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5z" />
                </svg>
              </div>
              <p className="text-neutral-600 dark:text-slate-300 font-medium">{t('noComments')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <div
                    className={`p-5 rounded-2xl border transition-shadow hover:shadow-sm ${
                      !comment.approved
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                        : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xs font-semibold shrink-0">
                            {(comment.userName || '?').slice(0, 2).toUpperCase()}
                          </span>
                          <span className="font-semibold text-neutral-800 dark:text-slate-100">
                            {comment.userName}
                          </span>
                          <span
                            className="text-sm text-neutral-400 dark:text-slate-500"
                            title={formatAbsolute(comment.createdAt, locale)}
                          >
                            {formatRelative(comment.createdAt, locale)}
                          </span>
                          {!comment.approved && (
                            <span
                              className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded-full"
                              title="Only you can see this comment until an admin approves it"
                            >
                              {t('pendingApproval')}
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex shrink-0 gap-1">
                          <button
                            onClick={() => {
                              if (!comment.approved) {
                                if (
                                  confirm(
                                    'This comment is not approved yet. Would you like to approve it first?'
                                  )
                                ) {
                                  handleApprove(comment.id)
                                }
                                return
                              }
                              setReplyingTo(replyingTo === comment.id ? null : comment.id)
                              setError(null)
                            }}
                            className="p-2 rounded-lg text-neutral-400 hover:text-violet-500 hover:bg-violet-50 dark:text-slate-500 dark:hover:text-violet-400 dark:hover:bg-violet-900/30 transition-colors cursor-pointer"
                            title={comment.approved ? 'Reply' : 'Approve first to reply'}
                            aria-label="Reply"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                              />
                            </svg>
                          </button>
                          {!comment.approved && (
                            <button
                              onClick={() => handleApprove(comment.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:text-slate-500 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
                              title="Approve comment"
                              aria-label="Approve comment"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                            title="Delete comment"
                            aria-label="Delete comment"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Reply Form */}
                    {isAdmin && replyingTo === comment.id && (
                      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-slate-700">
                        {error && (
                          <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                            {error}
                          </div>
                        )}
                        <div className="relative rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/30 transition-all">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={t('replyPlaceholder')}
                            className="w-full p-3 bg-transparent text-neutral-800 dark:text-slate-100 placeholder-neutral-400 dark:placeholder-slate-500 resize-none rounded-xl outline-none text-sm"
                            rows={3}
                            maxLength={MAX_LENGTH}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 gap-3">
                          <CharacterMeter length={replyContent.length} />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent('')
                                setError(null)
                              }}
                            >
                              {t('cancel')}
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              loading={isSubmittingReply}
                              disabled={!replyContent.trim() || isSubmittingReply}
                              onClick={() => handleReply(comment.id)}
                            >
                              {isSubmittingReply ? t('posting') : t('postReply')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-4 pl-4 border-l-2 border-violet-200 dark:border-violet-800/50 space-y-2">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-4 rounded-xl bg-violet-50 dark:bg-slate-700/50 border border-violet-100 dark:border-slate-600"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="font-semibold text-violet-700 dark:text-violet-300">
                                  {reply.userName}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-200 rounded-full">
                                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  {t('admin')}
                                </span>
                                <span
                                  className="text-sm text-neutral-400 dark:text-slate-500"
                                  title={formatAbsolute(reply.createdAt, locale)}
                                >
                                  {formatRelative(reply.createdAt, locale)}
                                </span>
                              </div>
                              <p className="text-neutral-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {reply.content}
                              </p>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(reply.id, true, comment.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors cursor-pointer shrink-0"
                                title="Delete reply"
                                aria-label="Delete reply"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pager
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={handlePageChange}
              labels={{ previous: t('previous'), next: t('next') }}
            />
          )}
        </>
      )}
    </div>
  )
}
