'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole } from '@/lib/user-roles'
import { useFetchWithRetry } from '@/lib/fetch-with-retry'
import { Badge, Button, Skeleton } from '@/components/ui'

interface Announcement {
  id: string
  type: string
  message: string
  active: boolean
  updatedAt: string
}

interface User {
  id: string
  authId: string
  email: string | null
  name: string | null
  role: string
  stripeSubscriptionStatus: string | null
  stripeSubscriptionStatusEs: string | null
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
  subscribersByLanguage?: {
    englishOnly: number
    spanishOnly: number
    both: number
    total: number
  }
}

type CommentSortField = 'createdAt' | 'userName' | 'deckTitle'
type SortOrder = 'asc' | 'desc'

const ACTIVE_STATUSES = ['active', 'trialing']

function SubscriptionBadges({ user }: { user: User }) {
  const enActive = ACTIVE_STATUSES.includes(user.stripeSubscriptionStatus || '')
  const esActive = ACTIVE_STATUSES.includes(user.stripeSubscriptionStatusEs || '')

  // Manually-assigned subscriber with no Stripe subscription on either locale gets all content
  const isManual =
    user.role === UserRole.SUBSCRIBER &&
    !user.stripeSubscriptionStatus &&
    !user.stripeSubscriptionStatusEs

  if (isManual) {
    return <Badge variant="success">Manual (all)</Badge>
  }

  if (!enActive && !esActive) {
    return <span className="text-sm text-ink-3">—</span>
  }

  return (
    <div className="flex gap-1.5">
      {enActive && <Badge variant="info">EN</Badge>}
      {esActive && <Badge variant="info">ES</Badge>}
    </div>
  )
}

function roleBadgeVariant(role: string): 'violet' | 'success' | 'neutral' {
  if (role === UserRole.ADMIN) return 'violet'
  if (role === UserRole.SUBSCRIBER) return 'success'
  return 'neutral'
}

// Show roles in sentence case. Unknown roles fall back to the raw value.
function roleLabel(role: string): string {
  if (role === UserRole.ADMIN) return 'Admin'
  if (role === UserRole.SUBSCRIBER) return 'Subscriber'
  if (role === UserRole.USER) return 'User'
  return role
}

const shell = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20'

const pageTitle =
  'font-display font-black text-ink text-5xl sm:text-6xl leading-[0.88] tracking-[-0.01em]'

const sectionTitle = 'font-display text-3xl text-ink'

const inputCls =
  'rounded-[10px] border border-line-strong bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-3 hover:border-ink-3 transition-colors'

function StatGrid({
  items,
  size = 'lg',
}: {
  items: { label: string; value: number }[]
  size?: 'lg' | 'md'
}) {
  return (
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line rounded-2xl overflow-hidden">
      {items.map((item) => (
        <div key={item.label} className={`bg-surface ${size === 'lg' ? 'p-5' : 'px-5 py-4'}`}>
          <dt className="text-sm text-ink-2">{item.label}</dt>
          <dd
            className={`mt-1.5 font-display font-extrabold text-ink tabular-nums leading-none ${
              size === 'lg' ? 'text-5xl' : 'text-4xl'
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function UsersTableSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden" aria-hidden="true">
      <div className="px-4 py-3 flex gap-4 border-b border-line">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-4 border-t border-line first:border-t-0 flex gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-16" rounded="full" />
          <Skeleton className="h-8 w-24" rounded="lg" />
        </div>
      ))}
    </div>
  )
}

function SortButton({
  active,
  order,
  onClick,
  children,
}: {
  active: boolean
  order: SortOrder
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 text-sm font-semibold rounded-[8px] transition-colors cursor-pointer ${
        active ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:text-ink'
      }`}
    >
      {children}
      {active && <span aria-hidden="true"> {order === 'asc' ? '↑' : '↓'}</span>}
    </button>
  )
}

function AnnouncementPanel({
  title,
  description,
  active,
  value,
  onChange,
  placeholder,
  saving,
  onSave,
  onClear,
}: {
  title: string
  description: string
  active: boolean
  value: string
  onChange: (v: string) => void
  placeholder: string
  saving: boolean
  onSave: () => void
  onClear: () => void
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        {active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Off</Badge>}
      </div>
      <p className="mt-1 text-sm text-ink-2">{description}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={title}
        rows={3}
        className={`${inputCls} mt-4 block w-full resize-y text-base`}
      />
      <div className="flex flex-wrap gap-2 mt-3">
        <Button size="sm" onClick={onSave} disabled={saving || !value.trim()}>
          {saving ? 'Saving…' : 'Set announcement'}
        </Button>
        <Button size="sm" variant="secondary" onClick={onClear} disabled={saving || !active}>
          Clear
        </Button>
      </div>
    </div>
  )
}

function SimplePager({
  pagination,
  onChange,
  showTotal = false,
}: {
  pagination: Pagination
  onChange: (page: number) => void
  showTotal?: boolean
}) {
  return (
    <nav className="flex flex-wrap items-center gap-3 mt-5" aria-label="Pagination">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onChange(pagination.page - 1)}
        disabled={pagination.page === 1}
      >
        Previous
      </Button>
      <span className="text-sm text-ink-2 tabular-nums">
        Page {pagination.page} of {pagination.totalPages}
        {showTotal && ` (${pagination.total} total)`}
      </span>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onChange(pagination.page + 1)}
        disabled={pagination.page === pagination.totalPages}
      >
        Next
      </Button>
    </nav>
  )
}

export default function AdminPage() {
  const { isLoaded, isSignedIn } = useUser()
  const fetchWithRetry = useFetchWithRetry()
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [publicMessage, setPublicMessage] = useState('')
  const [subscriberMessage, setSubscriberMessage] = useState('')
  const [savingAnnouncement, setSavingAnnouncement] = useState<string | null>(null)

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

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetchWithRetry('/api/admin/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements)
        const pub = data.announcements.find((a: Announcement) => a.type === 'PUBLIC')
        const sub = data.announcements.find((a: Announcement) => a.type === 'SUBSCRIBER')
        setPublicMessage(pub?.message || '')
        setSubscriberMessage(sub?.message || '')
      }
    } catch {
      console.error('Failed to fetch announcements')
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
      Promise.all([fetchStats(), fetchUsers(''), fetchPendingComments(1, commentSortBy, commentSortOrder), fetchAnnouncements()]).finally(() => {
        setInitialLoading(false)
      })
    } else if (isLoaded && !isSignedIn) {
      setInitialLoading(false)
    }
  }, [isLoaded, isSignedIn, fetchStats, fetchUsers, fetchPendingComments, fetchAnnouncements, commentSortBy, commentSortOrder])

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
    if (!confirm('Are you sure you want to delete this comment?')) return
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

  const saveAnnouncement = async (type: 'PUBLIC' | 'SUBSCRIBER') => {
    const message = type === 'PUBLIC' ? publicMessage : subscriberMessage
    if (!message.trim()) return
    if (!confirm(`Are you sure you want to set the ${type.toLowerCase()} announcement?`)) return
    setSavingAnnouncement(type)
    try {
      const res = await fetchWithRetry('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: message.trim(), active: true }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save announcement')
      }
      await fetchAnnouncements()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save announcement')
    } finally {
      setSavingAnnouncement(null)
    }
  }

  const clearAnnouncement = async (type: 'PUBLIC' | 'SUBSCRIBER') => {
    if (!confirm(`Are you sure you want to clear the ${type.toLowerCase()} announcement?`)) return
    setSavingAnnouncement(type)
    try {
      const res = await fetchWithRetry('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: '', active: false }),
      })
      if (!res.ok) {
        throw new Error('Failed to clear announcement')
      }
      if (type === 'PUBLIC') setPublicMessage('')
      else setSubscriberMessage('')
      await fetchAnnouncements()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear announcement')
    } finally {
      setSavingAnnouncement(null)
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
      <main className="min-h-screen">
        <div className={shell} aria-hidden="true">
          <Skeleton className="h-12 w-72" />

          <Skeleton className="mt-12 h-7 w-40 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line rounded-2xl overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface p-5">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-10 w-16" />
              </div>
            ))}
          </div>

          <Skeleton className="mt-14 h-7 w-44 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-line bg-surface p-6">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-64 mb-4" />
                <Skeleton className="h-20 w-full mb-3" rounded="lg" />
                <Skeleton className="h-9 w-36" rounded="lg" />
              </div>
            ))}
          </div>

          <Skeleton className="mt-14 h-7 w-48 mb-4" />
          <div className="border-t border-line">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="py-5 border-b border-line">
                <Skeleton className="h-5 w-40 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>

          <Skeleton className="mt-14 h-7 w-40 mb-4" />
          <div className="flex gap-3 mb-5">
            <Skeleton className="flex-1 h-11" rounded="lg" />
            <Skeleton className="h-11 w-24" rounded="lg" />
          </div>
          <UsersTableSkeleton />
        </div>
      </main>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen">
        <div className={shell}>
          <h1 className={pageTitle}>Admin dashboard</h1>
          <p className="mt-4 text-ink-2">Please sign in to access this page</p>
        </div>
      </main>
    )
  }

  if (error === 'You do not have permission to access this page') {
    return (
      <main className="min-h-screen">
        <div className={shell}>
          <h1 className={pageTitle}>Admin dashboard</h1>
          <p role="alert" className="mt-4 text-bad">{error}</p>
        </div>
      </main>
    )
  }

  const publicActive = !!announcements.find((a) => a.type === 'PUBLIC')?.active
  const subscriberActive = !!announcements.find((a) => a.type === 'SUBSCRIBER')?.active

  return (
    <main className="min-h-screen">
      <div className={shell}>
        <h1 className={pageTitle}>Admin dashboard</h1>

        {/* Stats Section */}
        {stats && (
          <section className="mt-12" aria-labelledby="admin-stats">
            <h2 id="admin-stats" className={`${sectionTitle} mb-4`}>
              Users
            </h2>
            <StatGrid
              items={[
                { label: 'Total users', value: stats.totalUsers },
                { label: 'Admins', value: stats.byRole[UserRole.ADMIN] || 0 },
                { label: 'Subscribers', value: stats.byRole[UserRole.SUBSCRIBER] || 0 },
                { label: 'Regular users', value: stats.byRole[UserRole.USER] || 0 },
              ]}
            />

            {/* Subscriber Language Breakdown */}
            {stats.subscribersByLanguage && (
              <div className="mt-8">
                <h3 className="font-display text-xl text-ink mb-3">
                  Subscribers by language
                </h3>
                <StatGrid
                  size="md"
                  items={[
                    { label: 'English only', value: stats.subscribersByLanguage.englishOnly },
                    { label: 'Spanish only', value: stats.subscribersByLanguage.spanishOnly },
                    { label: 'Both languages', value: stats.subscribersByLanguage.both },
                    { label: 'Total active', value: stats.subscribersByLanguage.total },
                  ]}
                />
              </div>
            )}
          </section>
        )}

        {/* Announcements Section */}
        <section className="mt-14" aria-labelledby="admin-announcements">
          <h2 id="admin-announcements" className={`${sectionTitle} mb-4`}>
            Announcements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnnouncementPanel
              title="Public announcement"
              description="Visible to all visitors"
              active={publicActive}
              value={publicMessage}
              onChange={setPublicMessage}
              placeholder="Enter announcement message..."
              saving={savingAnnouncement === 'PUBLIC'}
              onSave={() => saveAnnouncement('PUBLIC')}
              onClear={() => clearAnnouncement('PUBLIC')}
            />
            <AnnouncementPanel
              title="Subscriber announcement"
              description="Only visible to subscribers and admins"
              active={subscriberActive}
              value={subscriberMessage}
              onChange={setSubscriberMessage}
              placeholder="Enter subscriber announcement message..."
              saving={savingAnnouncement === 'SUBSCRIBER'}
              onSave={() => saveAnnouncement('SUBSCRIBER')}
              onClear={() => clearAnnouncement('SUBSCRIBER')}
            />
          </div>
        </section>

        {/* Pending Comments Section */}
        <section className="mt-14" aria-labelledby="admin-pending">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <h2 id="admin-pending" className={sectionTitle}>
              Pending comments
              <span className="ml-3 font-sans text-base font-semibold text-ink-3 align-middle tabular-nums">
                {commentPagination?.total || 0}
              </span>
            </h2>
            {commentPagination && commentPagination.total > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-2">Sort by</span>
                <div className="inline-flex rounded-[10px] border border-line-strong bg-surface p-0.5">
                  <SortButton
                    active={commentSortBy === 'createdAt'}
                    order={commentSortOrder}
                    onClick={() => handleCommentSortChange('createdAt')}
                  >
                    Date
                  </SortButton>
                  <SortButton
                    active={commentSortBy === 'userName'}
                    order={commentSortOrder}
                    onClick={() => handleCommentSortChange('userName')}
                  >
                    User
                  </SortButton>
                  <SortButton
                    active={commentSortBy === 'deckTitle'}
                    order={commentSortOrder}
                    onClick={() => handleCommentSortChange('deckTitle')}
                  >
                    Deck
                  </SortButton>
                </div>
              </div>
            )}
          </div>
          {pendingComments.length === 0 ? (
            <p className="border-t border-line pt-5 text-ink-2">No pending comments</p>
          ) : (
            <>
              <ul className="border-t border-line">
                {pendingComments.map((comment) => (
                  <li key={comment.id} className="py-5 border-b border-line">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
                      <p className="text-ink-2">
                        <span className="font-semibold text-ink">{comment.userName}</span> on{' '}
                        {comment.deckTitle || 'Other'}
                      </p>
                      <time dateTime={comment.createdAt} className="text-sm text-ink-3">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="text-ink whitespace-pre-wrap break-words max-w-[72ch]">
                      {comment.content}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => approveComment(comment.id, true)}
                        disabled={updatingCommentId === comment.id}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="hover:text-bad hover:border-bad"
                        onClick={() => deleteComment(comment.id)}
                        disabled={updatingCommentId === comment.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Comment Pagination */}
              {commentPagination && commentPagination.totalPages > 1 && (
                <SimplePager pagination={commentPagination} onChange={handleCommentPageChange} />
              )}
            </>
          )}
        </section>

        {/* Users Section */}
        <section className="mt-14" aria-labelledby="admin-users">
          <h2 id="admin-users" className={`${sectionTitle} mb-4`}>
            Manage users
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              aria-label="Search users"
              className={`${inputCls} min-w-0 flex-1`}
            />
            <Button type="submit">Search</Button>
          </form>

          {/* Error Display */}
          {error && error !== 'You do not have permission to access this page' && (
            <div role="alert" className="mb-4 rounded-[10px] bg-bad-soft text-bad px-4 py-3">
              {error}
            </div>
          )}

          {/* Users Table */}
          {loading ? (
            <UsersTableSkeleton />
          ) : (
            <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-ink-2">
                    <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Role</th>
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Subscription</th>
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Change role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="px-4 py-3.5 text-ink font-semibold">{user.name || '—'}</td>
                      <td className="px-4 py-3.5 text-ink-2 break-all">{user.email || '—'}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <SubscriptionBadges user={user} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value, user.name)}
                          disabled={updatingUserId === user.id}
                          aria-label={`Role for ${user.name || user.email || 'user'}`}
                          className="rounded-[10px] border border-line-strong bg-surface px-2.5 py-1.5 text-sm text-ink hover:border-ink-3 transition-colors disabled:opacity-50"
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
                      <td colSpan={5} className="px-4 py-8 text-ink-2">
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
            <SimplePager pagination={userPagination} onChange={handleUserPageChange} showTotal />
          )}
        </section>
      </div>
    </main>
  )
}
