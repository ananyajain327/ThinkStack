import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { get } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import type { DecisionSession, FeedItem } from '../api/types'
import { formatDate, timeAgo, titleCase } from '../lib/format'
import { cn } from '../lib/cn'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageLoader,
  SectionHeading,
  statusTone,
} from '../components/ui'
import {
  IconArrowRight,
  IconBell,
  IconBook,
  IconBookmark,
  IconCompass,
  IconGrid,
  IconSparkles,
  IconTarget,
} from '../components/icons'

const feedIcon: Record<string, typeof IconBell> = {
  DECISION: IconCompass,
  SESSION: IconCompass,
  PRICE_DROP: IconTarget,
  PRICE_ALERT: IconTarget,
  NOTIFICATION: IconBell,
  JOURNAL: IconBook,
  BOOKMARK: IconBookmark,
  RECOMMENDATION: IconSparkles,
  PRODUCT: IconGrid,
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const sessions = useAsync(() => get<DecisionSession[]>('/decisions/mine'), [])
  const feed = useAsync(() => get<FeedItem[]>('/feed', { params: { limit: 8 } }), [])

  const all = sessions.data ?? []
  const active = all.filter((s) => s.status === 'IN_PROGRESS' || s.status === 'DRAFT').length
  const completed = all.filter((s) => s.status === 'COMPLETED' || s.status === 'PURCHASED').length

  const stats = [
    { label: 'Total decisions', value: all.length, icon: IconCompass, tone: 'text-indigo-600 bg-indigo-50' },
    { label: 'In progress', value: active, icon: IconTarget, tone: 'text-amber-600 bg-amber-50' },
    { label: 'Completed', value: completed, icon: IconSparkles, tone: 'text-emerald-600 bg-emerald-50' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greeting()}, {user?.username}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s an overview of your decision journeys.</p>
        </div>
        <Link to="/wizard">
          <Button>
            <IconCompass className="h-4 w-4" />
            New decision
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', s.tone)}>
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading
            title="Your decisions"
            subtitle="Pick up where you left off."
            action={
              <Link to="/wizard">
                <Button variant="outline" size="sm">
                  New decision
                </Button>
              </Link>
            }
          />

          {sessions.loading ? (
            <PageLoader label="Loading your decisions…" />
          ) : sessions.error ? (
            <EmptyState title="Could not load decisions" description={sessions.error} action={<Button onClick={sessions.reload}>Retry</Button>} />
          ) : all.length === 0 ? (
            <EmptyState
              icon={<IconCompass className="h-6 w-6" />}
              title="No decisions yet"
              description="Start your first decision journey and let ThinkStack guide you to the right choice."
              action={
                <Link to="/wizard">
                  <Button>
                    <IconCompass className="h-4 w-4" /> Start a decision
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {all.map((session) => (
                <Link
                  key={session.id}
                  to={`/decisions/${session.id}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">{session.title}</h3>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {session.categoryName} · {session.answers.length} answers
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">Updated {formatDate(session.updatedAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge tone={statusTone(session.status)}>{titleCase(session.status)}</Badge>
                      <IconArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionHeading title="Recent activity" />
          {feed.loading ? (
            <PageLoader />
          ) : (feed.data ?? []).length === 0 ? (
            <Card className="p-6 text-sm text-slate-500">No recent activity yet.</Card>
          ) : (
            <Card className="divide-y divide-slate-100">
              {(feed.data ?? []).map((item) => {
                const Icon = feedIcon[item.type] ?? IconBell
                return (
                  <div key={item.id} className="flex gap-3 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                      {item.body && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.body}</p>}
                      <p className="mt-1 text-xs text-slate-400">{timeAgo(item.occurredAt)}</p>
                    </div>
                  </div>
                )
              })}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
