'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole } from '@/lib/user-roles'
import { fetchWithRetry } from '@/lib/fetch-with-retry'

interface User {
  id: string
  authId: string
  email: string | null
  name: string | null
  role: string
  createdAt: string
}

interface Comment {
  id: string
  content: string
  deckSlug: string | null
  deckTitle: string | null
  userId: string
  userName: string
  approved: boolean
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Stats {
  totalUsers: number
  byRole: Record<string, number>
}

type CommentSortField = 'createdAt' | 'userName' | 'deckTitle'
type SortOrder = 'asc' | 'desc'

export default function AdminPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [userPagination, setUserPagination] = useState<Pagination | null>(null)
  const [pendingComments, setPendingComments] = useState<Comment[]>([])
  const [commentPagination, setCommentPagination] = useState<Pagination | null>(null)
  const [commentSortBy, setCommentSortBy] = useState<CommentSortField>('createdAt')
  const [commentSortOrder, setCommentSortOrder] = useState<SortOrder>('asc')
  const [stats, setStats] = useState<Stats | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetchWithRetry('/api/admin/stats')
      if (!res.ok) {
        if (res.status === 403) {
          setError('You do not have permission to access this page')
          return
        }
        throw new Error('Failed to fetch stats')
      }
      const data = await res.json()
      setStats(data)
    } catch {
      setError('Failed to load stats')
    }
  }, [])

  const fetchPendingComments = useCallback(async (page = 1, sortBy: CommentSortField = 'createdAt', sortOrder: SortOrder = 'asc') => {
    try {
      const res = await fetchWithRetry(`/api/admin/comments?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
      if (res.ok) {
        const data = await res.json()
        setPendingComments(data.comments)
        setCommentPagination(data.pagination)
      }
    } catch {
      console.error('Failed to fetch pending comments')
    }
  }, [])

  const fetchUsers = useCallback(async (searchQuery: string, page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page) })
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetchWithRetry(`/api/admin/users?${params}`)
      if (!res.ok) {
        if (res.status === 403) {
          setError('You do not have permission to access this page')
          return
        }
        throw new Error('Failed to fetch users')
      }
      const data = await res.json()
      setUsers(data.users)
      setUserPagination(data.pagination)
      setError(null)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      Promise.all([fetchStats(), fetchUsers(''), fetchPendingComments(1, commentSortBy, commentSortOrder)]).finally(() => {
        setInitialLoading(false)
      })
    } else if (isLoaded && !isSignedIn) {
      setInitialLoading(false)
    }
  }, [isLoaded, isSignedIn, fetchStats, fetchUsers, fetchPendingComments, commentSortBy, commentSortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(search, 1)
  }

  const handleUserPageChange = (page: number) => {
    fetchUsers(search, page)
  }

  const handleCommentPageChange = (page: number) => {
    fetchPendingComments(page, commentSortBy, commentSortOrder)
  }

  const handleCommentSortChange = (sortBy: CommentSortField) => {
    if (sortBy === commentSortBy) {
      const newOrder = commentSortOrder === 'asc' ? 'desc' : 'asc'
      setCommentSortOrder(newOrder)
      fetchPendingComments(1, sortBy, newOrder)
    } else {
      setCommentSortBy(sortBy)
      setCommentSortOrder('asc')
      fetchPendingComments(1, sortBy, 'asc')
    }
  }

  const approveComment = async (commentId: string, approved: boolean) => {
    setUpdatingCommentId(commentId)
    try {
      const res = await fetchWithRetry(`/api/admin/comments/${commentId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
      if (!res.ok) {
        throw new Error('Failed to update comment')
      }
      await fetchPendingComments(commentPagination?.page || 1, commentSortBy, commentSortOrder)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment')
    } finally {
      setUpdatingCommentId(null)
    }
  }

  const deleteComment = async (commentId: string) => {
    setUpdatingCommentId(commentId)
    try {
      const res = await fetchWithRetry(`/api/admin/comments/${commentId}/approve`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error('Failed to delete comment')
      }
      await fetchPendingComments(commentPagination?.page || 1, commentSortBy, commentSortOrder)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
    } finally {
      setUpdatingCommentId(null)
    }
  }

  const updateUserRole = async (userId: string, newRole: string, userName: string | null) => {
    if (!confirm(`Are you sure you want to change ${userName || 'this user'}'s role to ${newRole}?`)) {
      return
    }
    setUpdatingUserId(userId)
    try {
      const res = await fetchWithRetry(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update role')
      }
      // Refresh users and stats
      await Promise.all([fetchUsers(search, userPagination?.page || 1), fetchStats()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (!isLoaded || initialLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-slate-600 dark:text-slate-400">Loading...</div>
        </div>
      </main>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-slate-600 dark:text-slate-400">
            Please sign in to access this page
          </div>
        </div>
      </main>
    )
  }

  if (error === 'You do not have permission to access this page') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-red-600 dark:text-red-400">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
          Admin Dashboard
        </h1>

        {/* Stats Section */}
        {stats && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              User Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.byRole[UserRole.ADMIN] || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Admins</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.byRole[UserRole.SUBSCRIBER] || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Subscribers</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                  {stats.byRole[UserRole.USER] || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Regular Users</div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Comments Section */}
        <div className="mt-12 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Pending Comments ({commentPagination?.total || 0})
            </h2>
            {commentPagination && commentPagination.total > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
                <button
                  onClick={() => handleCommentSortChange('createdAt')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    commentSortBy === 'createdAt'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Date {commentSortBy === 'createdAt' && (commentSortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleCommentSortChange('userName')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    commentSortBy === 'userName'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  User {commentSortBy === 'userName' && (commentSortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleCommentSortChange('deckTitle')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    commentSortBy === 'deckTitle'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Deck {commentSortBy === 'deckTitle' && (commentSortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            )}
          </div>
          {pendingComments.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center text-slate-500 dark:text-slate-400">
              No pending comments
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {pendingComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {comment.userName}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                          on {comment.deckTitle || 'Other'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveComment(comment.id, true)}
                        disabled={updatingCommentId === comment.id}
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        disabled={updatingCommentId === comment.id}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Comment Pagination */}
              {commentPagination && commentPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => handleCommentPageChange(commentPagination.page - 1)}
                    disabled={commentPagination.page === 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {commentPagination.page} of {commentPagination.totalPages}
                  </span>
                  <button
                    onClick={() => handleCommentPageChange(commentPagination.page + 1)}
                    disabled={commentPagination.page === commentPagination.totalPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Manage Users
          </h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && error !== 'You do not have permission to access this page' && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">Loading users...</div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-4 text-sm text-slate-900 dark:text-slate-100">
                      {user.name || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 break-all">
                      {user.email || '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === UserRole.ADMIN
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                            : user.role === UserRole.SUBSCRIBER
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value, user.name)}
                        disabled={updatingUserId === user.id}
                        className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      >
                        <option value={UserRole.USER}>User</option>
                        <option value={UserRole.SUBSCRIBER}>Subscriber</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* User Pagination */}
        {userPagination && userPagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => handleUserPageChange(userPagination.page - 1)}
              disabled={userPagination.page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {userPagination.page} of {userPagination.totalPages} ({userPagination.total} total)
            </span>
            <button
              onClick={() => handleUserPageChange(userPagination.page + 1)}
              disabled={userPagination.page === userPagination.totalPages}
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
