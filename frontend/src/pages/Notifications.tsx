import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  productName?: string
  isRead: boolean
  createdAt: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = () => {
    const url = filter === 'unread' ? '/notifications?unreadOnly=true' : '/notifications'
    api.get(url)
      .then(res => setNotifications(res.data.data || []))
      .catch(() => {})
    api.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data.data?.count || 0))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const markRead = async (id: string) => {
    await api.post(`/notifications/${id}/read`).then(load).catch(() => {})
  }

  const markAllRead = async () => {
    await api.post('/notifications/read-all').then(load).catch(() => {})
  }

  const remove = async (id: string) => {
    await api.delete(`/notifications/${id}`).then(load).catch(() => {})
  }

  const typeIcons: Record<string, string> = {
    PRICE_DROP: '💰',
    PRICE_ALERT: '🔔',
    DECISION_REMINDER: '📝',
    RECOMMENDATION: '🎯',
    SYSTEM: '⚙️',
    PRODUCT_UPDATE: '📦',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-indigo-600 mt-1">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm ${filter === 'unread' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
              >
                Unread
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">🔔</div>
            <p className="text-gray-600">No notifications.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white p-4 rounded-xl border flex items-start gap-3 ${
                  n.isRead ? 'border-gray-100' : 'border-indigo-200 bg-indigo-50/30'
                }`}
              >
                <span className="text-xl mt-0.5">{typeIcons[n.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                    {n.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {!n.isRead && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-indigo-600 hover:text-indigo-800">
                      Mark read
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} className="text-xs text-gray-400 hover:text-red-600">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
