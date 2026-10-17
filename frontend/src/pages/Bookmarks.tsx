import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import type { BookmarkItem } from '../api/types'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookmarks')
      .then(res => setBookmarks(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/bookmarks/${id}`)
      setBookmarks(bookmarks.filter(b => b.id !== id))
    } catch {
      alert('Failed to delete bookmark')
    }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookmarks</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">🔖</div>
            <p className="text-gray-600">No bookmarks yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{bm.productName || bm.sessionTitle}</p>
                  <p className="text-sm text-gray-500">{bm.type === 'PRODUCT' ? 'Product' : 'Decision'}</p>
                </div>
                <button
                  onClick={() => handleDelete(bm.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
