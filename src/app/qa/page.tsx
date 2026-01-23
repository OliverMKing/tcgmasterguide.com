'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  deckSlug: string | null
  deckTitle: string | null
  userName: string
  userId: string
  approved: boolean
  createdAt: string
}

interface Deck {
  slug: string
  title: string
}

export default function QAPage() {
  const { isSignedIn, isLoaded } = useUser()
  const { isAdmin } = useCurrentUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [decks, setDecks] = useState<Deck[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [selectedDeck, setSelectedDeck] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch('/api/comments')
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data)
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
    fetchComments()
    fetchDecks()
  }, [fetchComments, fetchDecks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    const selectedDeckData = decks.find((d) => d.slug === selectedDeck)

    try {
      const response = await fetch('/api/comments', {
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
      setComments((prev) => [comment, ...prev])
      setNewQuestion('')
      setSelectedDeck('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post question')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete question')

      setComments((prev) => prev.filter((q) => q.id !== commentId))
    } catch {
      setError('Failed to delete question')
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/approve`, {
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

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Questions List */}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
          Questions & Comments
        </h2>
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
              <div
                key={comment.id}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
