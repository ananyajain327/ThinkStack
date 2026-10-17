import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import type { DecisionSession } from '../api/types'

export default function DecisionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<DecisionSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    api.get(`/decisions/${sessionId}`)
      .then(res => setSession(res.data.data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!session) return <div className="min-h-screen flex items-center justify-center text-gray-500">Decision not found</div>

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
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
            <p className="mt-1 text-gray-600">{session.categoryName}</p>
            <p className="mt-1 text-sm text-gray-400">
              Created {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColor[session.status] || 'bg-gray-100 text-gray-700'}`}>
            {session.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to={`/decisions/${session.id}/wizard`}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900">Wizard Answers</h3>
            <p className="mt-1 text-sm text-gray-600">
              {session.answers.length} answers given
            </p>
          </Link>

          <Link
            to={`/decisions/${session.id}/recommendations`}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900">Recommendations</h3>
            <p className="mt-1 text-sm text-gray-600">View ranked results</p>
          </Link>

          <Link
            to={`/decisions/${session.id}/compare`}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900">Compare</h3>
            <p className="mt-1 text-sm text-gray-600">Side-by-side view</p>
          </Link>
        </div>

        {session.answers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Answers</h2>
            <div className="space-y-3">
              {session.answers.map((answer) => (
                <div key={answer.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{answer.questionText}</span>
                  <span className="text-sm font-medium text-gray-900 ml-4 text-right">{answer.answerValue}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
