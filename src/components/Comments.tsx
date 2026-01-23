'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'

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

interface CommentsProps {
  deckSlug: string
  deckTitle: string
}

export default function Comments({ deckSlug, deckTitle }: CommentsProps) {
  const { isSignedIn, isLoaded } = useUser()
  const { isAdmin } = useCurrentUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?deckSlug=${deckSlug}`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data)
    } catch {
      setError('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }, [deckSlug])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/comments', {
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
      const response = await fetch('/api/comments', {
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
      const response = await fetch(`/api/comments/${commentId}`, {
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
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch {
      setError('Failed to delete')
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      })

      if (!response.ok) throw new Error('Failed to approve comment')

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, approved: true } : c))
      )
    } catch {
      setError('Failed to approve comment')
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

  return (
    <div className="mt-16 border-t border-slate-200 dark:border-slate-700 pt-12">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">
        Discussion
      </h2>

      {/* Comment Form */}
      {isLoaded && (
        <div className="mb-8">
          {isSignedIn ? (
            <form onSubmit={handleSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this deck..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-slate-400 dark:text-slate-500">
                  {newComment.length}/2000
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Sign in to join the discussion
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
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
          No comments yet. Be the first to share your thoughts!
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
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {comment.userName}
                      </span>
                      <span className="text-sm text-slate-400 dark:text-slate-500">
                        {formatDate(comment.createdAt)}
                      </span>
                      {!comment.approved && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded-full" title="Only you can see this comment until an admin approves it">
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
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="p-2 text-slate-400 hover:text-purple-500 dark:text-slate-500 dark:hover:text-purple-400 transition-colors cursor-pointer"
                        title="Reply"
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
                          title="Approve comment"
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
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                {isAdmin && replyingTo === comment.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                <div className="ml-8 mt-2 space-y-2">
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
    </div>
  )
}
