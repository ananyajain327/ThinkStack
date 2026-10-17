import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

interface DecisionSession {
  id: string
  title: string
  status: string
  categoryName: string
  createdAt: string
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<DecisionSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/decisions')
      .then(res => setSessions(res.data.content || res.data))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
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
            <span className="text-sm text-gray-600">Hi, {user?.name || user?.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
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
          <Link
            to="/wizard"
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            + New Decision
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-lg font-semibold text-gray-900">No decisions yet</h2>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Start your first decision journey and let ThinkStack guide you to the right choice.
            </p>
            <Link
              to="/wizard"
              className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Start a Decision
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{session.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[session.status] || 'bg-gray-100 text-gray-700'}`}>
                    {session.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{session.categoryName}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
                <Link
                  to={`/decisions/${session.id}`}
                  className="mt-4 block text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
