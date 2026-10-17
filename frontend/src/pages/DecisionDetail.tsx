import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { get, post } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../components/Toast'
import type { DecisionSession, DecisionSummary } from '../api/types'
import { formatDate } from '../lib/format'
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageLoader,
  SectionHeading,
  statusTone,
} from '../components/ui'
import {
  IconBook,
  IconBookmark,
  IconChart,
  IconCheck,
  IconCompass,
  IconScale,
  IconSparkles,
  IconTarget,
} from '../components/icons'

export default function DecisionDetail() {
  const { sessionId = '' } = useParams<{ sessionId: string }>()
  const toast = useToast()
  const session = useAsync(() => get<DecisionSession>(`/decisions/${sessionId}`), [sessionId])
  const [summary, setSummary] = useState<DecisionSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  if (session.loading) return <PageLoader label="Loading decision…" />
  if (session.error || !session.data) {
    return (
      <EmptyState
        title="Decision not found"
        description={session.error ?? 'This decision may have been removed.'}
        action={<Link to="/dashboard"><Button>Back to dashboard</Button></Link>}
      />
    )
  }

  const s = session.data
  const hasRecommendations = s.status === 'COMPLETED' || s.status === 'PURCHASED'

  const loadSummary = async () => {
    setSummaryLoading(true)
    try {
      setSummary(await get<DecisionSummary>(`/decisions/${sessionId}/summary`))
    } catch (err) {
      toast.error('Could not generate summary', apiErrorMessage(err))
    } finally {
      setSummaryLoading(false)
    }
  }

  const bookmarkSession = async () => {
    try {
      await post('/bookmarks', { bookmarkType: 'SESSION', sessionId })
      setBookmarked(true)
      toast.success('Decision saved to bookmarks')
    } catch (err) {
      const msg = apiErrorMessage(err)
      if (msg.toLowerCase().includes('already')) {
        setBookmarked(true)
        toast.info('Already bookmarked')
      } else {
        toast.error('Could not bookmark', msg)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
            ← Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{s.title}</h1>
          <p className="mt-1 text-slate-500">
            {s.categoryName} · created {formatDate(s.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={statusTone(s.status)}>{s.status.replace(/_/g, ' ')}</Badge>
          <Button
            variant={bookmarked ? 'ghost' : 'outline'}
            size="sm"
            onClick={bookmarkSession}
            disabled={bookmarked}
          >
            <IconBookmark className="h-4 w-4" /> {bookmarked ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ActionCard
          to={`/decisions/${s.id}/wizard`}
          icon={<IconCompass className="h-5 w-5" />}
          title="Wizard answers"
          subtitle={`${s.answers.length} answered`}
        />
        <ActionCard
          to={`/decisions/${s.id}/recommendations`}
          icon={<IconTarget className="h-5 w-5" />}
          title="Recommendations"
          subtitle={hasRecommendations ? 'View ranked picks' : 'Generate picks'}
        />
        <ActionCard
          to={`/decisions/${s.id}/compare`}
          icon={<IconScale className="h-5 w-5" />}
          title="Compare"
          subtitle="Side-by-side trade-offs"
        />
      </div>

      {hasRecommendations && (
        <Card className="p-5 sm:p-6">
          <SectionHeading
            title="Decision summary"
            subtitle="A plain-language recap of your options."
            action={
              <Button variant="outline" size="sm" onClick={loadSummary} loading={summaryLoading}>
                <IconSparkles className="h-4 w-4" /> {summary ? 'Refresh' : 'Summarize'}
              </Button>
            }
          />
          {!summary ? (
            <p className="text-sm text-slate-500">
              Generate an AI-assisted summary highlighting the top pick, key reasons and caveats.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={summary.aiGenerated ? 'purple' : 'slate'}>
                  {summary.aiGenerated ? 'AI-generated' : 'Rule-based'}
                </Badge>
                <span className="text-sm text-slate-500">
                  {summary.recommendationCount} options considered
                </span>
              </div>
              {summary.topRecommendation && (
                <p className="text-slate-700">
                  Top pick: <span className="font-semibold text-slate-900">{summary.topRecommendation}</span>
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {summary.keyReasons.length > 0 && (
                  <div>
                    <h4 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                      <IconCheck className="h-4 w-4" /> Key reasons
                    </h4>
                    <ul className="space-y-1">
                      {summary.keyReasons.map((r, i) => (
                        <li key={i} className="text-sm text-slate-600">• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.caveats.length > 0 && (
                  <div>
                    <h4 className="mb-1.5 text-sm font-semibold text-amber-700">Caveats</h4>
                    <ul className="space-y-1">
                      {summary.caveats.map((c, i) => (
                        <li key={i} className="text-sm text-slate-600">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      <div>
        <SectionHeading
          title="Your answers"
          subtitle={`${s.answers.length} responses`}
          action={
            <Link to={`/journal?session=${s.id}`}>
              <Button variant="subtle" size="sm">
                <IconBook className="h-4 w-4" /> Log outcome
              </Button>
            </Link>
          }
        />
        {s.answers.length === 0 ? (
          <Alert tone="info">
            No answers yet. <Link to={`/decisions/${s.id}/wizard`} className="font-semibold underline">Start the wizard</Link>.
          </Alert>
        ) : (
          <Card className="divide-y divide-slate-100">
            {s.answers.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span className="text-sm text-slate-500">{a.questionText}</span>
                <span className="text-sm font-medium text-slate-800">{a.answerValue || '—'}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}

function ActionCard({
  to,
  icon,
  title,
  subtitle,
}: {
  to: string
  icon: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</span>
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 transition group-hover:opacity-100">
        Open <IconChart className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}
