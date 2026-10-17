import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Profile() {
  const { user, logout } = useAuth()
  const [prefs, setPrefs] = useState<any>(null)
  const [dna, setDna] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/me/preferences').then(res => setPrefs(res.data.data)).catch(() => {})
    api.get('/dna').then(res => setDna(res.data.data || [])).catch(() => {})
  }, [])

  const handleSavePrefs = async () => {
    if (!prefs) return
    setSaving(true)
    try {
      await api.put('/me/preferences', prefs)
      alert('Preferences saved!')
    } catch {
      alert('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
          <div className="flex gap-3">
            <Link to="/bookmarks" className="text-sm text-gray-600 hover:text-gray-900">Bookmarks</Link>
            <Link to="/journal" className="text-sm text-gray-600 hover:text-gray-900">Journal</Link>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Username</span>
              <span className="font-medium text-gray-900">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role</span>
              <span className="font-medium text-gray-900">{user?.role}</span>
            </div>
          </div>
        </div>

        {prefs && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  value={prefs.experienceLevel || ''}
                  onChange={(e) => setPrefs({ ...prefs, experienceLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={prefs.preferredCurrency || ''}
                  onChange={(e) => setPrefs({ ...prefs, preferredCurrency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSavePrefs}
              disabled={saving}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}

        {dna.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Decision DNA</h2>
            <p className="text-sm text-gray-600 mb-4">Patterns learned from your past decisions.</p>
            <div className="space-y-3">
              {dna.map((factor) => (
                <div key={factor.factor}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{factor.factor.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{(factor.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, factor.weight * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
