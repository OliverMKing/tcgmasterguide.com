'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import Link from 'next/link'

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
  const { isSignedIn, isLoaded } = useUser()
  const { isAdmin } = useCurrentUser()
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
      })
      if (deckFilter === 'other') {
        params.set('deckSlug', '')
      } else if (deckFilter !== 'all') {
        params.set('deckSlug', deckFilter)
      }
      const response = await fetch(`/api/comments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data.comments)
      setPagination(data.pagination)
    } catch {
      setError('Failed to load questions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchDecks = useCallback(async () => {
    try {
      const response = await fetch('/api/decks')
      if (response.ok) {
        const data = await response.json()
        setDecks(data)
      }
    } catch {
      console.error('Failed to fetch decks')
    }
  }, [])

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
      setError(err instanceof Error ? err.message : 'Failed to post question')
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
      setError(err instanceof Error ? err.message : 'Failed to post reply')
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
      setError('Failed to delete')
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
      setError('Failed to approve question')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Questions and Answers
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Want to know more about a deck or the game in general? Ask here and get answers from Grant.
        </p>

        {/* Question Form */}
        {isLoaded && (
          <div className="mb-12">
            {isSignedIn ? (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Related Deck (optional)
                  </label>
                  <select
                    value={selectedDeck}
                    onChange={(e) => setSelectedDeck(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Other</option>
                    {decks.map((deck) => (
                      <option key={deck.slug} value={deck.slug}>
                        {deck.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What would you like to know?"
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-slate-400 dark:text-slate-500">
                      {newQuestion.length}/2000
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newQuestion.trim() || isSubmitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Question'}
                </button>
              </form>
            ) : (
              <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Sign in to ask a question
                </p>
                <SignInButton mode="modal">
                  <button className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        )}

        {error && !replyingTo && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Questions List */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Questions & Comments {pagination && `(${pagination.total})`}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterDeck}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-1 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Decks</option>
              <option value="other">Other</option>
              {decks.map((deck) => (
                <option key={deck.slug} value={deck.slug}>
                  {deck.title}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-500 dark:text-slate-400">Sort:</span>
            <button
              onClick={() => handleSortChange('createdAt')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors cursor-pointer ${
                sortBy === 'createdAt'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No questions yet. Be the first to ask!
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id}>
                <div
                  className={`p-5 rounded-xl border ${
                    !comment.approved
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {comment.userName}
                        </span>
                        <span className="text-sm text-slate-400 dark:text-slate-500">
                          {formatDate(comment.createdAt)}
                        </span>
                        {comment.deckTitle ? (
                          <Link
                            href={`/decks/${comment.deckSlug}`}
                            className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors"
                          >
                            {comment.deckTitle}
                          </Link>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                            Other
                          </span>
                        )}
                        {!comment.approved && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded-full">
                            Pending approval
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex shrink-0 gap-1">
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
                          className="p-2 text-slate-400 hover:text-purple-500 dark:text-slate-500 dark:hover:text-purple-400 transition-colors cursor-pointer"
                          title={comment.approved ? "Reply" : "Approve first to reply"}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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
                            className="p-2 text-slate-400 hover:text-green-500 dark:text-slate-500 dark:hover:text-green-400 transition-colors cursor-pointer"
                            title="Approve question"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                          className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete question"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      {error && (
                        <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                          {error}
                        </div>
                      )}
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                        rows={3}
                        maxLength={2000}
                      />
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                            setError(null)
                          }}
                          className="px-4 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyContent.trim() || isSubmittingReply}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-purple-200 dark:border-purple-800 space-y-2">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-purple-700 dark:text-purple-300">
                                {reply.userName}
                              </span>
                              <span className="px-2 py-0.5 text-xs font-medium bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full">
                                Admin
                              </span>
                              <span className="text-sm text-slate-400 dark:text-slate-500">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(reply.id, true, comment.id)}
                              className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0"
                              title="Delete reply"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
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
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
