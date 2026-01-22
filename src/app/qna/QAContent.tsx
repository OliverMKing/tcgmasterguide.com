'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'

interface Comment {
  id: string
  content: string
  deckSlug: string | null
  userName: string
  userId: string
  createdAt: string
  replies: Comment[]
}

export default function QAContent() {
  const { isSignedIn, user, isLoaded } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const isAdmin = userRole === 'ADMIN'

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch('/api/qna')
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data.comments)
    } catch {
      setError('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch user role separately
  useEffect(() => {
    if (isSignedIn && userRole === null) {
      fetch('/api/user/role')
        .then((res) => res.json())
        .then((data) => {
          if (data.role) setUserRole(data.role)
        })
        .catch(() => {})
    }
  }, [isSignedIn, userRole])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newQuestion }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post question')
      }

      const comment = await response.json()
      setComments((prev) => [comment, ...prev])
      setNewQuestion('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post question')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmittingReply) return

    setIsSubmittingReply(true)
    setError(null)

    try {
      const response = await fetch(`/api/comments/${parentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post reply')
      }

      const reply = await response.json()
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...comment.replies, reply] }
            : comment
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

  const handleDelete = async (commentId: string, parentId?: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      if (parentId) {
        // It's a reply
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: comment.replies.filter((r) => r.id !== commentId),
                }
              : comment
          )
        )
      } else {
        // It's a top-level comment
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch {
      setError('Failed to delete comment')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const canDelete = (commentUserId: string) => {
    return isAdmin || user?.id === commentUserId
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-fuchsia-600/10 dark:from-purple-600/20 dark:to-fuchsia-600/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent mb-4">
              Q&A
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Ask questions and discuss deck strategies with Grant
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Question Form */}
        {isLoaded && (
          <div className="mb-12">
            {isSignedIn ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Ask a Question
                </h2>
                <form onSubmit={handleSubmitQuestion}>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What would you like to know about the Pokemon TCG?"
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-slate-400 dark:text-slate-500">
                      {newQuestion.length}/2000
                    </span>
                    <button
                      type="submit"
                      disabled={!newQuestion.trim() || isSubmitting}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Question'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Sign in to ask questions and participate in discussions
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

        {/* Comments List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            All Discussions
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-12">
              No discussions yet. Be the first to ask a question!
            </p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Main Comment */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {comment.userName}
                          </span>
                          <span className="text-sm text-slate-400 dark:text-slate-500">
                            {formatDate(comment.createdAt)}
                          </span>
                          {comment.deckSlug && (
                            <Link
                              href={`/decks/${comment.deckSlug}`}
                              className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors"
                            >
                              {comment.deckSlug}
                            </Link>
                          )}
                          {!comment.deckSlug && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                              Q&A
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                      {canDelete(comment.userId) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="shrink-0 p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete comment"
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
                      )}
                    </div>

                    {/* Reply Button */}
                    {isSignedIn && (
                      <div className="mt-3">
                        <button
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === comment.id ? null : comment.id
                            )
                          }
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium cursor-pointer"
                        >
                          {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                        </button>
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-4">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write your reply..."
                          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                          rows={3}
                          maxLength={2000}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {replyContent.length}/2000
                          </span>
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim() || isSubmittingReply}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-4 pl-8 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                  {reply.userName}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                            {canDelete(reply.userId) && (
                              <button
                                onClick={() =>
                                  handleDelete(reply.id, comment.id)
                                }
                                className="shrink-0 p-1.5 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors cursor-pointer"
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
        </div>
      </div>
    </main>
  )
}
