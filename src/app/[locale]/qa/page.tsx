'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useTranslations, useLocale } from 'next-intl'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useFetchWithRetry } from '@/lib/fetch-with-retry'
import { Link } from '@/i18n/navigation'
import { Button, Badge, Skeleton } from '@/components/ui'

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
  deckSlug: string | null
  deckTitle: string | null
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

interface Deck {
  slug: string
  title: string
}

type SortField = 'createdAt' | 'userName'
type SortOrder = 'asc' | 'desc'

export default function QAPage() {
  const t = useTranslations('qa')
  const locale = useLocale()
  const { isSignedIn, isLoaded } = useUser()
  const { isAdmin, hasSubscriberAccess, isLoaded: userLoaded } = useCurrentUser()
  const fetchWithRetry = useFetchWithRetry()
  const [comments, setComments] = useState<Comment[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterDeck, setFilterDeck] = useState<string>('all')
  const [decks, setDecks] = useState<Deck[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [selectedDeck, setSelectedDeck] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const fetchComments = useCallback(async (page = 1, sort: SortField = 'createdAt', order: SortOrder = 'desc', deckFilter: string = 'all') => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        sortBy: sort,
        sortOrder: order,
        locale,
      })
      if (deckFilter === 'other') {
        params.set('deckSlug', '')
      } else if (deckFilter !== 'all') {
        params.set('deckSlug', deckFilter)
      }
      const response = await fetchWithRetry(`/api/comments?${params}`, { forceRefresh: true })
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data.comments)
      setPagination(data.pagination)
    } catch {
      setError(t('failedToLoad'))
    } finally {
      setIsLoading(false)
    }
  }, [fetchWithRetry, t, locale])

  const fetchDecks = useCallback(async () => {
    try {
      const response = await fetchWithRetry('/api/decks', { forceRefresh: true })
      if (response.ok) {
        const data = await response.json()
        setDecks(data)
      }
    } catch {
      console.error('Failed to fetch decks')
    }
  }, [fetchWithRetry])

  useEffect(() => {
    fetchComments(1, sortBy, sortOrder, filterDeck)
    fetchDecks()
  }, [fetchComments, fetchDecks, sortBy, sortOrder, filterDeck])

  const handlePageChange = (page: number) => {
    fetchComments(page, sortBy, sortOrder, filterDeck)
  }

  const handleSortChange = (field: SortField) => {
    if (field === sortBy) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      setSortOrder(newOrder)
      fetchComments(1, field, newOrder, filterDeck)
    } else {
      setSortBy(field)
      setSortOrder('desc')
      fetchComments(1, field, 'desc', filterDeck)
    }
  }

  const handleFilterChange = (deck: string) => {
    setFilterDeck(deck)
    fetchComments(1, sortBy, sortOrder, deck)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    const selectedDeckData = decks.find((d) => d.slug === selectedDeck)

    try {
      const response = await fetchWithRetry('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newQuestion,
          deckSlug: selectedDeck || null,
          deckTitle: selectedDeckData?.title || null,
          locale,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post question')
      }

      const comment = await response.json()
      setComments((prev) => [{ ...comment, replies: [] }, ...prev])
      setNewQuestion('')
      setSelectedDeck('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToPost'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmittingReply) return

    setIsSubmittingReply(true)
    setError(null)

    const parentComment = comments.find((c) => c.id === parentId)

    try {
      const response = await fetchWithRetry('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          parentId,
          deckSlug: parentComment?.deckSlug || null,
          deckTitle: parentComment?.deckTitle || null,
          locale,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post reply')
      }

      const reply = await response.json()
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c
        )
      )
      setReplyContent('')
      setReplyingTo(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToPost'))
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleDelete = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!confirm('Are you sure you want to delete this?')) return

    try {
      const response = await fetchWithRetry(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
              : c
          )
        )
      } else {
        setComments((prev) => prev.filter((q) => q.id !== commentId))
      }
    } catch {
      setError(t('failedToDelete'))
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      const response = await fetchWithRetry(`/api/admin/comments/${commentId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      })

      if (!response.ok) throw new Error('Failed to approve question')

      setComments((prev) =>
        prev.map((q) => (q.id === commentId ? { ...q, approved: true } : q))
      )
    } catch {
      setError(t('failedToApprove'))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-20">
        <div className="max-w-3xl">
          <header>
            <h1 className="font-display font-black text-ink text-[clamp(3rem,8vw,4.75rem)] leading-[0.88] tracking-[-0.01em]">
              {t('title')}
            </h1>
            <p className="mt-4 text-lg text-ink-2 max-w-[60ch]">{t('subtitle')}</p>
          </header>

          {/* Subscriber Gate */}
          {isLoaded && userLoaded && !hasSubscriberAccess && (
            <section className="mt-10 rounded-2xl border border-line bg-surface p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="hidden sm:inline-flex shrink-0 w-10 h-10 rounded-full bg-accent-soft text-accent-text items-center justify-center">
                  <LockIcon className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-display text-3xl text-ink">{t('subscriberOnly')}</h2>
                  <p className="mt-2 text-ink-2 max-w-[56ch]">{t('subscriberOnlyMessage')}</p>
                  <div className="mt-6">
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
            </section>
          )}

          {/* Loading State */}
          {(!isLoaded || !userLoaded) && (
            <div className="mt-10" aria-hidden="true">
              <Skeleton className="h-4 w-40 mb-3" />
              <Skeleton className="h-11 w-full mb-5" rounded="lg" />
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-32 w-full mb-4" rounded="lg" />
              <Skeleton className="h-11 w-40" rounded="lg" />
              <div className="mt-14 border-t border-line">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="py-6 border-b border-line">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content - Only for Subscribers */}
          {isLoaded && userLoaded && hasSubscriberAccess && (
            <>
              {/* Question Form */}
              {isLoaded && (
                <div className="mt-10">
                  {isSignedIn ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="qa-deck" className={labelCls}>
                          {t('relatedDeck')}
                        </label>
                        <select
                          id="qa-deck"
                          value={selectedDeck}
                          onChange={(e) => setSelectedDeck(e.target.value)}
                          className={`${inputCls} w-full sm:max-w-sm`}
                        >
                          <option value="">{t('other')}</option>
                          {decks.map((deck) => (
                            <option key={deck.slug} value={deck.slug}>
                              {deck.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="qa-question" className={labelCls}>
                          {t('yourQuestion')}
                        </label>
                        <textarea
                          id="qa-question"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder={t('questionPlaceholder')}
                          className={`${inputCls} w-full resize-y min-h-28 leading-relaxed`}
                          rows={4}
                          maxLength={2000}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <Button
                          type="submit"
                          variant="primary"
                          loading={isSubmitting}
                          disabled={!newQuestion.trim() || isSubmitting}
                        >
                          {isSubmitting ? t('submitting') : t('submitQuestion')}
                        </Button>
                        <span className="text-sm text-ink-3 tabular-nums">
                          {newQuestion.length}/2000
                        </span>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-2xl border border-line bg-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-ink-2">{t('signInToAsk')}</p>
                      <SignInButton mode="modal">
                        <button className={`${primaryBtn} self-start sm:self-auto`}>
                          {t('signIn')}
                        </button>
                      </SignInButton>
                    </div>
                  )}
                </div>
              )}

              {error && !replyingTo && (
                <div role="alert" className="mt-6 rounded-[10px] bg-bad-soft text-bad px-4 py-3">
                  {error}
                </div>
              )}

              {/* Questions List */}
              <section className="mt-16" aria-labelledby="qa-list-heading">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4">
                  <h2 id="qa-list-heading" className="font-display text-3xl sm:text-4xl text-ink">
                    {t('questionsAndComments')}
                    {pagination && (
                      <span className="ml-3 font-sans text-base font-semibold text-ink-3 align-middle tabular-nums">
                        {pagination.total}
                      </span>
                    )}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={filterDeck}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      aria-label={t('filterByDeck')}
                      className={`${inputCls} text-sm py-1.5 max-w-[14rem]`}
                    >
                      <option value="all">{t('allDecks')}</option>
                      <option value="other">{t('other')}</option>
                      {decks.map((deck) => (
                        <option key={deck.slug} value={deck.slug}>
                          {deck.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSortChange('createdAt')}
                      className="inline-flex items-center gap-1.5 rounded-[10px] border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink hover:border-ink transition-colors cursor-pointer"
                    >
                      <SortIcon className="w-4 h-4 text-ink-3" />
                      {sortOrder === 'asc' ? t('oldestFirst') : t('newestFirst')}
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="border-t border-line" aria-hidden="true">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="py-6 border-b border-line">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="border-t border-line pt-8 text-ink-2">{t('noQuestions')}</p>
                ) : (
                  <ol className="border-t border-line">
                    {comments.map((comment) => (
                      <li key={comment.id} className="py-6 border-b border-line">
                        <article>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
                                <span className="font-semibold text-ink">{comment.userName}</span>
                                <time dateTime={comment.createdAt} className="text-sm text-ink-3">
                                  {formatDate(comment.createdAt)}
                                </time>
                                {comment.deckTitle ? (
                                  <Link
                                    href={`/decks/${comment.deckSlug}`}
                                    className="inline-flex items-center rounded-full bg-accent-soft text-accent-text px-2 py-0.5 text-xs font-semibold hover:underline underline-offset-2"
                                  >
                                    {comment.deckTitle}
                                  </Link>
                                ) : (
                                  <Badge variant="neutral">{t('other')}</Badge>
                                )}
                                {!comment.approved && (
                                  <Badge variant="warning">{t('pendingApproval')}</Badge>
                                )}
                              </div>
                              <p className="text-ink whitespace-pre-wrap break-words max-w-[68ch]">
                                {comment.content}
                              </p>
                            </div>
                            {isAdmin && (
                              <div className="flex shrink-0 gap-0.5 -mr-2 -mt-1">
                                <button
                                  onClick={() => {
                                    if (!comment.approved) {
                                      if (confirm('This question is not approved yet. Would you like to approve it first?')) {
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
                                    title="Approve question"
                                    aria-label="Approve question"
                                  >
                                    <CheckIcon className="w-5 h-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(comment.id)}
                                  className={`${iconBtn} hover:text-bad`}
                                  title="Delete question"
                                  aria-label="Delete question"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-5 ml-3 sm:ml-6 space-y-5">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="border-l-2 border-accent pl-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-1.5">
                                        <span className="font-semibold text-accent-text">{reply.userName}</span>
                                        <Badge variant="violet">{t('admin')}</Badge>
                                        <time dateTime={reply.createdAt} className="text-sm text-ink-3">
                                          {formatDate(reply.createdAt)}
                                        </time>
                                      </div>
                                      <p className="text-ink whitespace-pre-wrap break-words max-w-[68ch]">
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
                            <div className="mt-5 ml-3 sm:ml-6 border-l-2 border-line-strong pl-4">
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
                                className={`${inputCls} w-full resize-y text-base`}
                                rows={3}
                                maxLength={2000}
                              />
                              <div className="flex items-center justify-end gap-2 mt-2">
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
                          )}
                        </article>
                      </li>
                    ))}
                  </ol>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <nav className="flex items-center gap-3 mt-8" aria-label="Pagination">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      {t('previous')}
                    </Button>
                    <span className="text-sm text-ink-2 tabular-nums">
                      {t('page')} {pagination.page} {t('of')} {pagination.totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      {t('next')}
                    </Button>
                  </nav>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

const primaryBtn =
  'inline-flex items-center justify-center rounded-[10px] bg-accent text-accent-ink hover:bg-accent-hover font-semibold px-5 py-2.5 transition-colors cursor-pointer'

const inputCls =
  'rounded-[10px] border border-line-strong bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-3 hover:border-ink-3 transition-colors'

const labelCls = 'block text-sm font-semibold text-ink-2 mb-2'

const iconBtn =
  'p-2 rounded-[10px] text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer'

type IconProps = { className?: string }

function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

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

function SortIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l-3 3m3-3l3 3" />
    </svg>
  )
}
