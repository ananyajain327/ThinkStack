import { useEffect, useState } from 'react'
import { get, put, post } from '../api/rest'
import { apiErrorMessage } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import type { DnaFactor, UserPreference } from '../api/types'
import { formatDate, initials } from '../lib/format'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  PageLoader,
  ScoreBar,
} from '../components/ui'
import { IconCompass, IconRefresh } from '../components/icons'

const EXPERIENCE = [
  { value: '', label: 'Not set' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
]

const CURRENCIES = [
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
]

export default function Profile() {
  const { user, logout } = useAuth()
  const toast = useToast()

  const prefs = useAsync(() => get<UserPreference>('/me/preferences'), [])
  const dna = useAsync(() => get<DnaFactor[]>('/dna'), [])

  const [experienceLevel, setExperienceLevel] = useState('')
  const [defaultCurrency, setDefaultCurrency] = useState('INR')
  const [brandPreferences, setBrandPreferences] = useState('')
  const [osPreferences, setOsPreferences] = useState('')
  const [notifyPriceDrops, setNotifyPriceDrops] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const p = prefs.data
    if (!p) return
    setExperienceLevel(p.experienceLevel ?? '')
    setDefaultCurrency(p.defaultCurrency ?? 'INR')
    setBrandPreferences(p.brandPreferences ?? '')
    setOsPreferences(p.osPreferences ?? '')
    setNotifyPriceDrops(p.notifyPriceDrops ?? true)
  }, [prefs.data])

  const savePrefs = async () => {
    setSaving(true)
    try {
      await put('/me/preferences', {
        experienceLevel: experienceLevel || undefined,
        defaultCurrency,
        brandPreferences: brandPreferences.trim() || undefined,
        osPreferences: osPreferences.trim() || undefined,
        notifyPriceDrops,
      })
      toast.success('Preferences saved')
      prefs.reload()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const refreshDna = async () => {
    setRefreshing(true)
    try {
      await post('/dna/refresh')
      dna.reload()
      toast.success('Decision DNA refreshed')
    } catch {
      toast.error('Could not refresh DNA')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile &amp; preferences</h1>
        <p className="mt-1 text-slate-500">Tune how ThinkStack recommends products to you.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
            {initials(user?.username ?? '?')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900">{user?.username}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-1">
              <Badge tone="indigo">{user?.role}</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader title="Preferences" subtitle="Tune how recommendations are generated" />

          {prefs.loading ? (
            <PageLoader />
          ) : (
            <div className="mt-4 space-y-4">
              <Field label="Experience level">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {EXPERIENCE.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Default currency">
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Preferred brands" hint="Comma separated">
                <input
                  value={brandPreferences}
                  onChange={(e) => setBrandPreferences(e.target.value)}
                  placeholder="Apple, Sony, Samsung"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </Field>

              <Field label="Preferred platforms" hint="Comma separated">
                <input
                  value={osPreferences}
                  onChange={(e) => setOsPreferences(e.target.value)}
                  placeholder="Windows, Android"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </Field>

              <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={notifyPriceDrops}
                  onChange={(e) => setNotifyPriceDrops(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">Notify me about price drops</span>
              </label>

              <div className="flex justify-end">
                <Button onClick={savePrefs} disabled={saving}>
                  {saving ? 'Saving…' : 'Save preferences'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <CardHeader title="Decision DNA" subtitle="What drives your decisions" />
            <Button variant="outline" size="sm" onClick={refreshDna} disabled={refreshing}>
              <IconRefresh className="h-4 w-4" /> {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>

          {dna.loading ? (
            <PageLoader />
          ) : (dna.data ?? []).length === 0 ? (
            <EmptyState
              icon={<IconCompass className="h-6 w-6" />}
              title="Your DNA is still forming"
              description="Complete a few decisions and journal entries to build your decision profile."
            />
          ) : (
            <div className="mt-4 space-y-4">
              {(dna.data ?? []).map((f) => (
                <div key={f.id}>
                  <ScoreBar label={f.factor} value={f.score ?? 0} />
                  <p className="mt-1 text-xs text-slate-400">
                    {f.sampleSize != null ? `${f.sampleSize} signals` : ''}
                    {f.updatedAt ? ` · updated ${formatDate(f.updatedAt)}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
