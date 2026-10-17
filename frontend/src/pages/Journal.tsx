import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import type { JournalEntry } from '../api/types'

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/journal')
      .then(res => setEntries(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Decision Journal</h1>
        <p className="text-gray-600 mb-6">Reflect on past decisions and track outcomes.</p>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">📓</div>
            <p className="text-gray-600">No journal entries yet.</p>
            <p className="mt-2 text-sm text-gray-500">Complete a decision and add a journal entry to track your satisfaction over time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{entry.sessionTitle || 'Decision'}</h3>
                    {entry.productChosen && (
                      <p className="text-sm text-gray-600 mt-1">Chose: {entry.productChosen}</p>
                    )}
                  </div>
                  {entry.satisfactionRating && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span key={i} className={i <= entry.satisfactionRating! ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {entry.notes && (
                  <p className="mt-3 text-sm text-gray-700">{entry.notes}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
