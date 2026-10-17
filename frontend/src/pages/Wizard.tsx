import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '../api/client'
import { get, post } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../components/Toast'
import type { Category, DecisionSession, Wizard as WizardModel, WizardQuestion } from '../api/types'
import { cn } from '../lib/cn'
import { clamp } from '../lib/format'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  PageLoader,
} from '../components/ui'
import {
  IconArrowLeft,
  IconCheck,
  IconCompass,
  IconChevronRight,
  IconSparkles,
} from '../components/icons'

export default function Wizard() {
  const { sessionId } = useParams<{ sessionId: string }>()
  if (!sessionId) return <NewDecision />
  return <WizardForm sessionId={sessionId} />
}

/* ---------------------------------------------------------- New decision */

function CategoryMark({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function NewDecision() {
  const navigate = useNavigate()
  const toast = useToast()
  const categories = useAsync(() => get<Category[]>('/categories'), [])
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const start = async () => {
    if (!slug) return
    setCreating(true)
    setError('')
    try {
      const session = await post<DecisionSession>('/decisions', {
        categorySlug: slug,
        title: title.trim() || undefined,
      })
      navigate(`/decisions/${session.id}/wizard`)
    } catch (err) {
      setError(apiErrorMessage(err))
      toast.error('Could not start decision', apiErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Start a new decision</h1>
        <p className="mt-1 text-slate-500">
          Choose a category and we&apos;ll guide you through a short, tailored wizard.
        </p>
      </div>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {categories.loading ? (
        <PageLoader label="Loading categories…" />
      ) : categories.error ? (
        <EmptyState title="Could not load categories" description={categories.error} action={<Button onClick={categories.reload}>Retry</Button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(categories.data ?? []).map((c) => {
              const selected = slug === c.slug
              return (
                <button
                  key={c.slug}
                  onClick={() => setSlug(c.slug)}
                  className={cn(
                    'flex items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition',
                    selected ? 'border-indigo-600 shadow-md ring-1 ring-indigo-600' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <CategoryMark name={c.name} />
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-900">{c.name}</span>
                    {c.description && <span className="mt-0.5 block text-sm text-slate-500 line-clamp-2">{c.description}</span>}
                  </span>
                  {selected && <IconCheck className="ml-auto h-5 w-5 shrink-0 text-indigo-600" />}
                </button>
              )
            })}
          </div>

          <Card className="mt-6 p-6">
            <Field label="Name this decision" hint="Optional — e.g. “Laptop for college”">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My next purchase"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </Field>
            <div className="mt-5 flex justify-end">
              <Button size="lg" onClick={start} disabled={!slug} loading={creating}>
                <IconCompass className="h-4 w-4" />
                Start wizard
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- Wizard form */

interface Choice {
  label: string
  value: string
}

function parseChoices(raw?: string | null): Choice[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.map((o) =>
        typeof o === 'string'
          ? { label: o, value: o }
          : { label: String(o.label ?? o.value ?? ''), value: String(o.value ?? o.label ?? '') }
      )
    }
  } catch {
    /* ignore */
  }
  return []
}

function parseRange(raw?: string | null): { min: number; max: number; step: number; labels?: string[] } {
  const fallback = { min: 1, max: 5, step: 1, labels: undefined as string[] | undefined }
  if (!raw) return fallback
  try {
    const p = JSON.parse(raw)
    return {
      min: Number(p.min ?? 1),
      max: Number(p.max ?? 5),
      step: Number(p.step ?? 1),
      labels: Array.isArray(p.labels) ? p.labels.map(String) : undefined,
    }
  } catch {
    return fallback
  }
}

function isVisible(cond: string | undefined, answers: Record<string, string>): boolean {
  if (!cond) return true
  const m = cond.trim().match(/^(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/)
  if (!m) return true
  const [, key, op, rawVal] = m
  const val = rawVal.replace(/^["']|["']$/g, '')
  const cur = answers[key]
  if (cur == null) return false
  const a = Number(cur)
  const b = Number(val)
  const numeric = !Number.isNaN(a) && !Number.isNaN(b)
  switch (op) {
    case '==':
      return cur === val
    case '!=':
      return cur !== val
    case '>=':
      return numeric && a >= b
    case '<=':
      return numeric && a <= b
    case '>':
      return numeric && a > b
    case '<':
      return numeric && a < b
    default:
      return true
  }
}

function formatAnswer(question: WizardQuestion, raw?: string): string {
  if (!raw) return '—'
  const type = question.questionType
  if (type === 'SINGLE_CHOICE') {
    const c = parseChoices(question.options).find((o) => o.value === raw)
    return c?.label ?? raw
  }
  if (type === 'MULTI_CHOICE') {
    const choices = parseChoices(question.options)
    return raw
      .split(',')
      .map((v) => choices.find((o) => o.value === v)?.label ?? v)
      .join(', ')
  }
  return raw
}

function WizardForm({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate()
  const toast = useToast()

  const data = useAsync(async () => {
    const session = await get<DecisionSession>(`/decisions/${sessionId}`)
    const wizard = await get<WizardModel>(`/wizards/by-category/${session.categorySlug}`)
    return { session, wizard }
  }, [sessionId])

  return data.loading ? (
    <PageLoader label="Loading your wizard…" />
  ) : data.error || !data.data ? (
    <EmptyState
      title="Could not load this decision"
      description={data.error ?? 'The decision was not found.'}
      action={<Link to="/dashboard"><Button>Back to dashboard</Button></Link>}
    />
  ) : (
    <WizardStepper
      session={data.data.session}
      wizard={data.data.wizard}
      onDone={() => navigate(`/decisions/${sessionId}/recommendations`)}
      onError={(msg) => toast.error('Submission failed', msg)}
    />
  )
}

function WizardStepper({
  session,
  wizard,
  onDone,
  onError,
}: {
  session: DecisionSession
  wizard: WizardModel
  onDone: () => void
  onError: (msg: string) => void
}) {
  const initial = useMemo(() => {
    const map: Record<string, string> = {}
    session.answers.forEach((a) => {
      map[a.questionKey] = a.answerValue
    })
    return map
  }, [session])

  const [answers, setAnswers] = useState<Record<string, string>>(initial)
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const visible = useMemo(
    () => wizard.questions.filter((q) => isVisible(q.visibleIf, answers)),
    [wizard.questions, answers]
  )

  const isReview = index >= visible.length
  const question: WizardQuestion | undefined = visible[index]
  const progress = clamp(((index + (isReview ? 1 : 0)) / Math.max(1, visible.length)) * 100)
  const answeredCount = visible.filter((q) => (answers[q.questionKey] ?? '').trim() !== '').length

  const setAnswer = (key: string, value: string) => setAnswers((prev) => ({ ...prev, [key]: value }))

  const canProceed = !question || !question.required || (answers[question.questionKey] ?? '').trim() !== ''

  const goNext = () => {
    if (!question || canProceed) setIndex((i) => Math.min(visible.length, i + 1))
  }
  const goBack = () => setIndex((i) => Math.max(0, i - 1))

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const payload = Object.entries(answers)
        .filter(([, v]) => v != null && v !== '')
        .map(([questionKey, answerValue]) => ({ questionKey, answerValue }))
      await api.post(`/decisions/${session.id}/answers`, payload)
      await post(`/decisions/${session.id}/recommendations`)
      onDone()
    } catch (err) {
      const msg = apiErrorMessage(err)
      setError(msg)
      onError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <IconArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{wizard.name}</span>
          <span className="text-slate-500">
            {isReview ? 'Review' : `Question ${index + 1} of ${visible.length}`}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      <Card className="p-6 sm:p-8">
        {isReview || !question ? (
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ready to see your recommendations</h2>
            <p className="mt-1 text-slate-500">
              You answered {answeredCount} of {visible.length} questions. You can review below or generate now.
            </p>
            <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {visible.map((q) => {
                return (
                  <div key={q.questionKey} className="flex items-start justify-between gap-4 px-4 py-3">
                    <span className="text-sm text-slate-600">{q.questionText}</span>
                    <span className="max-w-[45%] text-right text-sm font-medium text-slate-900">
                      {formatAnswer(q, answers[q.questionKey])}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{question.questionText}</h2>
            {question.helpText && <p className="mt-2 text-sm text-slate-500">{question.helpText}</p>}
            <div className="mt-6">
              <QuestionInput question={question} value={answers[question.questionKey] ?? ''} onChange={(v) => setAnswer(question.questionKey, v)} />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={index === 0}
          >
            <IconArrowLeft className="h-4 w-4" /> Back
          </Button>
          {isReview ? (
            <Button size="lg" onClick={submit} loading={submitting}>
              <IconSparkles className="h-4 w-4" /> Generate recommendations
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canProceed}>
              {question?.required && (answers[question.questionKey] ?? '') === '' ? 'Answer to continue' : 'Next'}
              <IconChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: WizardQuestion
  value: string
  onChange: (v: string) => void
}) {
  switch (question.questionType) {
    case 'SINGLE_CHOICE': {
      const choices = parseChoices(question.options)
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {choices.map((c) => (
            <button
              key={c.value}
              onClick={() => onChange(c.value)}
              className={cn(
                'rounded-xl border-2 px-4 py-3 text-left text-sm transition',
                value === c.value
                  ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      )
    }

    case 'MULTI_CHOICE': {
      const choices = parseChoices(question.options)
      const selected = value ? value.split(',').filter(Boolean) : []
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {choices.map((c) => {
            const isSelected = selected.includes(c.value)
            return (
              <button
                key={c.value}
                onClick={() => {
                  const next = isSelected ? selected.filter((s) => s !== c.value) : [...selected, c.value]
                  onChange(next.join(','))
                }}
                className={cn(
                  'flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm transition',
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                )}
              >
                {c.label}
                {isSelected && <IconCheck className="h-4 w-4" />}
              </button>
            )
          })}
        </div>
      )
    }

    case 'BOOLEAN': {
      const choices = parseChoices(question.options)
      const yes = choices.find((c) => ['true', 'yes'].includes(c.value.toLowerCase()))
      const no = choices.find((c) => ['false', 'no'].includes(c.value.toLowerCase()))
      const options = [
        { label: yes?.label ?? 'Yes', value: yes?.value ?? 'true' },
        { label: no?.label ?? 'No', value: no?.value ?? 'false' },
      ]
      return (
        <div className="grid grid-cols-2 gap-3">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={cn(
                'rounded-xl border-2 px-4 py-3 font-medium transition',
                value === o.value ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )
    }

    case 'RANGE': {
      const { min, max, step, labels } = parseRange(question.options)
      const current = value === '' ? Math.round((min + max) / 2) : Number(value)
      const label = labels?.[clamp(current - min, 0, labels.length - 1)]
      return (
        <div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(e) => onChange(e.target.value)}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">{labels?.[0] ?? min}</span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              {label ?? current}
            </span>
            <span className="text-xs text-slate-400">{labels?.[labels.length - 1] ?? max}</span>
          </div>
        </div>
      )
    }

    case 'NUMBER': {
      const { min, max, step } = parseRange(question.options)
      return (
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${min} – ${max}`}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      )
    }

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer…"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      )
  }
}
