import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { get, post, put, del } from '../api/rest'
import { apiErrorMessage } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../components/Toast'
import type { DecisionSession, JournalEntry, JournalEntryRequest } from '../api/types'
import { formatDate } from '../lib/format'
import { cn } from '../lib/cn'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  PageLoader,
  Stars,
  statusTone,
} from '../components/ui'
import { IconBook, IconEdit, IconPlus, IconStar, IconTrash } from '../components/icons'

const OUTCOMES = [
  { value: 'PURCHASED', label: 'Purchased' },
  { value: 'DECIDED_OTHER', label: 'Decided something else' },
  { value: 'NOT_PURCHASED', label: 'Not purchased yet' },
]

function labelOutcome(value: string): string {
  return OUTCOMES.find((o) => o.value === value)?.label ?? value.replace(/_/g, ' ')
}

function parseTags(raw?: string | null): string[] {
  if (!raw) return []
  let value = raw.trim()
  try {
    const parsed = JSON.parse(value)
    if (typeof parsed === 'string') value = parsed
    else if (Array.isArray(parsed)) return parsed.map(String)
  } catch {
    /* treat as csv */
  }
  return value
    .replace(/^"+|"+$/g, '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

interface FormState {
  title: string
  sessionId: string
  notes: string
  outcome: string
  outcomeNotes: string
  satisfactionRating: number
  wouldBuyAgain: boolean | null
  tags: string
}

const emptyForm: FormState = {
  title: '',
  sessionId: '',
  notes: '',
  outcome: '',
  outcomeNotes: '',
  satisfactionRating: 0,
  wouldBuyAgain: null,
  tags: '',
}

export default function Journal() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const sessionParam = searchParams.get('session') ?? ''

  const entries = useAsync(() => get<JournalEntry[]>('/journal'), [])
  const sessions = useAsync(() => get<DecisionSession[]>('/decisions/mine'), [])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionParam) {
      setEditing(null)
      setForm({ ...emptyForm, sessionId: sessionParam })
      setOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, sessionId: sessionParam })
    setError('')
    setOpen(true)
  }

  const openEdit = (entry: JournalEntry) => {
    setEditing(entry)
    setForm({
      title: entry.title,
      sessionId: entry.sessionId ?? '',
      notes: entry.notes ?? '',
      outcome: entry.outcome ?? '',
      outcomeNotes: entry.outcomeNotes ?? '',
      satisfactionRating: entry.satisfactionRating ?? 0,
      wouldBuyAgain: entry.wouldBuyAgain ?? null,
      tags: parseTags(entry.tags).join(', '),
    })
    setError('')
    setOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) {
      setError('Please give the entry a title.')
      return
    }
    const payload: JournalEntryRequest = {
      title: form.title.trim(),
      sessionId: form.sessionId || undefined,
      notes: form.notes.trim() || undefined,
      outcome: form.outcome || undefined,
      outcomeNotes: form.outcomeNotes.trim() || undefined,
      satisfactionRating: form.satisfactionRating || undefined,
      wouldBuyAgain: form.wouldBuyAgain ?? undefined,
      tags: form.tags.trim() || undefined,
    }
    setSaving(true)
    setError('')
    try {
      if (editing) await put(`/journal/${editing.id}`, payload)
      else await post('/journal', payload)
      setOpen(false)
      entries.reload()
      toast.success(editing ? 'Journal entry updated' : 'Journal entry added')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (entry: JournalEntry) => {
    if (!window.confirm(`Delete “${entry.title}”?`)) return
    try {
      await del(`/journal/${entry.id}`)
      entries.reload()
      toast.success('Journal entry deleted')
    } catch {
      toast.error('Could not delete entry')
    }
  }

  const list = entries.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Decision journal</h1>
          <p className="mt-1 text-slate-500">Reflect on past decisions and track outcomes over time.</p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="h-4 w-4" /> New entry
        </Button>
      </div>

      {entries.loading ? (
        <PageLoader />
      ) : entries.error ? (
        <EmptyState title="Could not load journal" description={entries.error} action={<Button onClick={entries.reload}>Retry</Button>} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<IconBook className="h-6 w-6" />}
          title="No journal entries yet"
          description="Log what you decided and how it turned out — this also improves your Decision DNA."
          action={<Button onClick={openCreate}><IconPlus className="h-4 w-4" /> Add your first entry</Button>}
        />
      ) : (
        <div className="space-y-4">
          {list.map((entry) => {
            const tags = parseTags(entry.tags)
            return (
              <Card key={entry.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">Added {formatDate(entry.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.outcome && <Badge tone={statusTone(entry.outcome)}>{labelOutcome(entry.outcome)}</Badge>}
                    <button onClick={() => openEdit(entry)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Edit">
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(entry)}
                      className="rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {entry.notes && <p className="mt-3 text-sm leading-relaxed text-slate-600">{entry.notes}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  {entry.satisfactionRating ? (
                    <span className="flex items-center gap-2 text-slate-500">
                      Satisfaction <Stars value={entry.satisfactionRating} />
                    </span>
                  ) : null}
                  {entry.wouldBuyAgain != null && (
                    <Badge tone={entry.wouldBuyAgain ? 'emerald' : 'rose'}>
                      {entry.wouldBuyAgain ? 'Would buy again' : 'Would not buy again'}
                    </Badge>
                  )}
                  {entry.sessionId && (
                    <Link to={`/decisions/${entry.sessionId}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                      View decision
                    </Link>
                  )}
                </div>

                {entry.outcomeNotes && (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{entry.outcomeNotes}</p>
                )}

                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Badge key={t} tone="slate">#{t}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit journal entry' : 'New journal entry'} size="lg">
        {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <div className="space-y-4">
          <Field label="Title" required>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Bought the ASUS Vivobook"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </Field>

          <Field label="Linked decision" hint="Optional">
            <select
              value={form.sessionId}
              onChange={(e) => setForm({ ...form, sessionId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">None</option>
              {(sessions.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="How did the decision process go?"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Outcome">
              <select
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">Not set</option>
                {OUTCOMES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Would buy again?">
              <div className="flex gap-2">
                <Choice active={form.wouldBuyAgain === true} onClick={() => setForm({ ...form, wouldBuyAgain: true })}>
                  Yes
                </Choice>
                <Choice active={form.wouldBuyAgain === false} onClick={() => setForm({ ...form, wouldBuyAgain: false })}>
                  No
                </Choice>
                <Choice active={form.wouldBuyAgain === null} onClick={() => setForm({ ...form, wouldBuyAgain: null })}>
                  Unsure
                </Choice>
              </div>
            </Field>
          </div>

          <Field label="Satisfaction">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, satisfactionRating: form.satisfactionRating === i ? 0 : i })}
                  className="text-slate-200 transition hover:scale-110"
                  aria-label={`${i} stars`}
                >
                  <IconStar
                    className={cn('h-7 w-7', i <= form.satisfactionRating ? 'text-amber-400' : 'text-slate-200')}
                  />
                </button>
              ))}
            </div>
          </Field>

          <Field label="Outcome notes">
            <textarea
              value={form.outcomeNotes}
              onChange={(e) => setForm({ ...form, outcomeNotes: e.target.value })}
              rows={2}
              placeholder="Did it live up to expectations?"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </Field>

          <Field label="Tags" hint="Comma separated">
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="laptop, college, value"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            {editing ? 'Save changes' : 'Add entry'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-1.5 text-sm font-medium transition',
        active ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
      )}
    >
      {children}
    </button>
  )
}
