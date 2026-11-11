'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useFetchWithRetry } from '@/lib/fetch-with-retry'
import { Skeleton, Button, Badge } from '@/components/ui'

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
  const color = over ? 'bg-bad' : near ? 'bg-warn' : 'bg-accent'
  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <div className="h-1 flex-1 max-w-[120px] bg-surface-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs tabular-nums ${over ? 'text-bad' : near ? 'text-warn' : 'text-ink-3'}`}
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
    'min-w-9 h-9 px-3 inline-flex items-center justify-center text-sm font-semibold rounded-[10px] border transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
  const idleBtn = 'border-line-strong bg-surface text-ink-2 hover:border-ink hover:text-ink'

  return (
    <nav className="flex flex-wrap items-center gap-1.5 mt-6" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${baseBtn} ${idleBtn}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="sr-only">{labels.previous}</span>
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-sm text-ink-3" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${baseBtn} ${
              p === page ? 'border-transparent bg-accent text-accent-ink' : idleBtn
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
        className={`${baseBtn} ${idleBtn}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="sr-only">{labels.next}</span>
      </button>
    </nav>
  )
}

function Avatar({ name, admin = false }: { name: string; admin?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold shrink-0 ${
        admin ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2'
      }`}
    >
      {(name || '?').slice(0, 2).toUpperCase()}
    </span>
  )
}

const iconBtn =
  'p-2 rounded-[10px] text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer'

const primaryBtn =
  'inline-flex items-center justify-center rounded-[10px] bg-accent text-accent-ink hover:bg-accent-hover font-semibold px-5 py-2.5 transition-colors cursor-pointer'

type IconProps = { className?: string }

function ReplyIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  )
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function TrashIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
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
          `/api/comments?deckSlug=${deckSlug}&locale=${locale}&page=${page}&sortBy=${sort}&sortOrder=${order}`,
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
    [deckSlug, locale]
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
        body: JSON.stringify({ deckSlug, deckTitle, content: newComment, locale }),
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
          locale,
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

  const commentSkeleton = (
    <div className="border-t border-line" aria-hidden="true">
      {[1, 2].map((i) => (
        <div key={i} className="py-5 border-b border-line">
          <div className="flex items-center gap-2.5 mb-3">
            <Skeleton className="h-7 w-7" rounded="full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  )

  return (
    <section
      id="discussion"
      aria-labelledby="discussion-heading"
      className="mt-16 border-t border-line pt-10 scroll-mt-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 mb-6">
        <h2 id="discussion-heading" className="font-display font-black text-4xl sm:text-5xl text-ink leading-[0.9]">
          {t('title')}
          {hasSubscriberAccess && pagination && pagination.total > 0 && (
            <span className="ml-3 font-sans text-base font-semibold text-ink-3 align-middle tabular-nums">
              {pagination.total}
            </span>
          )}
        </h2>
        {hasSubscriberAccess && pagination && pagination.total > 0 && (
          <button
            onClick={() => handleSortChange('createdAt')}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink hover:border-ink transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l-3 3m3-3l3 3" />
            </svg>
            {sortOrder === 'asc' ? t('oldestFirst') : t('newestFirst')}
          </button>
        )}
      </div>

      {/* Subscriber Gate */}
      {isLoaded && userLoaded && !hasSubscriberAccess && (
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7 flex items-start gap-4">
          <span className="hidden sm:inline-flex shrink-0 w-10 h-10 rounded-full bg-accent-soft text-accent-text items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </span>
          <div>
            <h3 className="font-display text-2xl text-ink">{t('subscriberOnly')}</h3>
            <p className="mt-1.5 text-ink-2 max-w-[56ch]">{t('subscriberOnlyMessage')}</p>
            <div className="mt-5">
              {isSignedIn ? (
                <Link href="/subscribe" className={primaryBtn}>
                  {t('subscribeNow')}
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className={primaryBtn}>{t('signIn')}</button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(!isLoaded || !userLoaded) && (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-28 w-full mb-3" rounded="lg" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-32" rounded="lg" />
            </div>
          </div>
          {commentSkeleton}
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
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('placeholder')}
                    aria-label={t('placeholder')}
                    className="block w-full rounded-[10px] border border-line-strong bg-surface px-3.5 py-3 text-ink placeholder:text-ink-3 hover:border-ink-3 transition-colors resize-y leading-relaxed"
                    rows={3}
                    maxLength={MAX_LENGTH}
                  />
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
                <div className="rounded-2xl border border-line bg-surface p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-ink-2">{t('signInToComment')}</p>
                  <SignInButton mode="modal">
                    <button className={`${primaryBtn} self-start sm:self-auto`}>{t('signIn')}</button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}

          {error && !replyingTo && (
            <div role="alert" className="mb-6 rounded-[10px] bg-bad-soft text-bad px-4 py-3 flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93a10 10 0 1014.14 14.14A10 10 0 004.93 4.93z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Comments List */}
          {isLoading ? (
            commentSkeleton
          ) : comments.length === 0 ? (
            <div className="border-t border-line pt-6">
              <p className="text-ink-2 max-w-[60ch]">{t('noComments')}</p>
            </div>
          ) : (
            <ol className="border-t border-line">
              {comments.map((comment) => (
                <li key={comment.id} className="py-5 border-b border-line">
                  <article>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mb-2">
                          <Avatar name={comment.userName} />
                          <span className="font-semibold text-ink">{comment.userName}</span>
                          <time
                            dateTime={comment.createdAt}
                            className="text-sm text-ink-3"
                            title={formatAbsolute(comment.createdAt, locale)}
                          >
                            {formatRelative(comment.createdAt, locale)}
                          </time>
                          {!comment.approved && (
                            <span title="Only you can see this comment until an admin approves it">
                              <Badge variant="warning">{t('pendingApproval')}</Badge>
                            </span>
                          )}
                        </div>
                        <p className="text-ink whitespace-pre-wrap break-words leading-relaxed max-w-[68ch]">
                          {comment.content}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex shrink-0 gap-0.5 -mr-2 -mt-1">
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
                            className={iconBtn}
                            title={comment.approved ? 'Reply' : 'Approve first to reply'}
                            aria-label="Reply"
                          >
                            <ReplyIcon className="w-5 h-5" />
                          </button>
                          {!comment.approved && (
                            <button
                              onClick={() => handleApprove(comment.id)}
                              className={`${iconBtn} hover:text-ok`}
                              title="Approve comment"
                              aria-label="Approve comment"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className={`${iconBtn} hover:text-bad`}
                            title="Delete comment"
                            aria-label="Delete comment"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-3 sm:ml-9 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="border-l-2 border-accent pl-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-x-2.5 gap-y-1.5 mb-1.5 flex-wrap">
                                  <Avatar name={reply.userName} admin />
                                  <span className="font-semibold text-accent-text">{reply.userName}</span>
                                  <Badge variant="violet">{t('admin')}</Badge>
                                  <time
                                    dateTime={reply.createdAt}
                                    className="text-sm text-ink-3"
                                    title={formatAbsolute(reply.createdAt, locale)}
                                  >
                                    {formatRelative(reply.createdAt, locale)}
                                  </time>
                                </div>
                                <p className="text-ink whitespace-pre-wrap break-words leading-relaxed max-w-[68ch]">
                                  {reply.content}
                                </p>
                              </div>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDelete(reply.id, true, comment.id)}
                                  className={`${iconBtn} hover:text-bad shrink-0 -mr-2 -mt-1`}
                                  title="Delete reply"
                                  aria-label="Delete reply"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {isAdmin && replyingTo === comment.id && (
                      <div className="mt-4 ml-3 sm:ml-9 border-l-2 border-line-strong pl-4">
                        {error && (
                          <div role="alert" className="mb-3 rounded-[10px] bg-bad-soft text-bad px-3 py-2 text-sm">
                            {error}
                          </div>
                        )}
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={t('replyPlaceholder')}
                          aria-label={t('replyPlaceholder')}
                          className="block w-full rounded-[10px] border border-line-strong bg-surface px-3 py-2.5 text-ink placeholder:text-ink-3 hover:border-ink-3 transition-colors resize-y"
                          rows={3}
                          maxLength={MAX_LENGTH}
                        />
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
                  </article>
                </li>
              ))}
            </ol>
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
    </section>
  )
}
