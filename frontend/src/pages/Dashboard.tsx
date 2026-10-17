import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import type { DecisionSession, Category, FeedItem } from '../api/types'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<DecisionSession[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/decisions/mine').then(res => setSessions(res.data.data || [])).catch(() => {}),
      api.get('/categories').then(res => setCategories(res.data.data || [])).catch(() => {}),
      api.get('/feed').then(res => setFeed(res.data.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleCreate = async () => {
    if (!newCategory) return
    setCreating(true)
    try {
      const res = await api.post('/decisions', {
        categorySlug: newCategory,
        title: newTitle || undefined,
      })
      const session = res.data.data
      navigate(`/decisions/${session.id}/wizard`)
    } catch {
      alert('Failed to create decision')
    } finally {
      setCreating(false)
    }
  }

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    PURCHASED: 'bg-blue-100 text-blue-700',
    ARCHIVED: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user?.username}</span>
            <button onClick={handleLogout} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Decisions</h1>
            <p className="mt-1 text-gray-600">Track and manage your decision journeys</p>
          </div>
          <button
            onClick={() => setShowNew(!showNew)}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            + New Decision
          </button>
        </div>

        {showNew && (
          <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Start a New Decision</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a category...</option>
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. My next laptop"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCreate}
                  disabled={!newCategory || creating}
                  className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Start Wizard'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {sessions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <div className="text-4xl mb-4">🎯</div>
                  <h2 className="text-lg font-semibold text-gray-900">No decisions yet</h2>
                  <p className="mt-2 text-gray-600 max-w-md mx-auto">
                    Start your first decision journey and let ThinkStack guide you to the right choice.
                  </p>
                  <button
                    onClick={() => setShowNew(true)}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Start a Decision
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{session.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{session.categoryName}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[session.status] || 'bg-gray-100 text-gray-700'}`}>
                          {session.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <Link
                          to={`/decisions/${session.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View Details →
                        </Link>
                        {session.status !== 'COMPLETED' && (
                          <Link
                            to={`/decisions/${session.id}/wizard`}
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            Continue Wizard →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              {feed.length === 0 ? (
                <p className="text-sm text-gray-500">No recent activity.</p>
              ) : (
                <div className="space-y-3">
                  {feed.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
