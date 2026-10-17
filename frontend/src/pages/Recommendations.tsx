import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { get, post } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../components/Toast'
import type { DecisionSession, Explainability, Recommendation } from '../api/types'
import { parseList, parseObject } from '../lib/json'
import { formatCurrency } from '../lib/format'
import { cn } from '../lib/cn'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageLoader,
  ProductImage,
  ScoreBar,
  ScoreRing,
  Stars,
  statusTone,
} from '../components/ui'
import {
  IconBookmark,
  IconCheck,
  IconChevronDown,
  IconExternal,
  IconScale,
  IconSparkles,
  IconThumbsDown,
  IconThumbsUp,
  IconAlert,
} from '../components/icons'

export default function Recommendations() {
  const { sessionId = '' } = useParams<{ sessionId: string }>()
  const toast = useToast()

  const data = useAsync(async () => {
    const session = await get<DecisionSession>(`/decisions/${sessionId}`)
    const recs = await get<Recommendation[]>(`/decisions/${sessionId}/recommendations`)
    return { session, recs: recs ?? [] }
  }, [sessionId])

  if (data.loading) return <PageLoader label="Analysing your options…" />
  if (data.error || !data.data) {
    return (
      <EmptyState
        title="Could not load recommendations"
        description={data.error ?? 'Something went wrong.'}
        action={<Button onClick={data.reload}>Retry</Button>}
      />
    )
  }

  const { session, recs } = data.data
  if (recs.length === 0) {
    return (
      <EmptyState
        icon={<IconSparkles className="h-6 w-6" />}
        title="No recommendations yet"
        description="Complete the wizard to generate personalised recommendations."
        action={
          <Link to={`/decisions/${sessionId}/wizard`}>
            <Button>Go to wizard</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to={`/decisions/${sessionId}`} className="text-sm text-slate-500 hover:text-slate-800">
            ← Back to decision
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Recommendations</h1>
          <p className="mt-1 text-slate-500">
            For <span className="font-medium text-slate-700">{session.title}</span> · {session.categoryName}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/decisions/${sessionId}/compare`}>
            <Button variant="outline">
              <IconScale className="h-4 w-4" /> Compare
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-5">
        {recs.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} sessionId={sessionId} onToast={toast} />
        ))}
      </div>
    </div>
  )
}

function RecommendationCard({
  rec,
  sessionId,
  onToast,
}: {
  rec: Recommendation
  sessionId: string
  onToast: { success: (t: string, d?: string) => void; info: (t: string, d?: string) => void; error: (t: string, d?: string) => void }
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<'bookmark' | 'compare' | null>(null)
  const [addedCompare, setAddedCompare] = useState(false)
  const isTop = rec.rankPosition === 1

  const explain = parseObject<Explainability>(rec.explainability)
  const advantages = parseList<string>(rec.advantages)
  const disadvantages = parseList<string>(rec.disadvantages)
  const tradeOffs = parseList<string>(rec.tradeOffs)
  const dealBreakers = parseList<string>(rec.dealBreakers)

  const bookmark = async () => {
    setBusy('bookmark')
    try {
      await post('/bookmarks', { bookmarkType: 'PRODUCT', productId: rec.product.id })
      onToast.success('Saved to bookmarks')
    } catch (err) {
      const msg = apiErrorMessage(err)
      if (msg.toLowerCase().includes('already')) onToast.info('Already bookmarked')
      else onToast.error('Could not bookmark', msg)
    } finally {
      setBusy(null)
    }
  }

  const addToCompare = async () => {
    setBusy('compare')
    try {
      await post(`/decisions/${sessionId}/alternatives/${rec.product.id}`)
      setAddedCompare(true)
      onToast.success('Added to your comparison set')
    } catch (err) {
      const msg = apiErrorMessage(err)
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
        setAddedCompare(true)
        onToast.info('Already in your comparison set')
      } else {
        onToast.error('Could not add to comparison', msg)
      }
    } finally {
      setBusy(null)
    }
  }

  const dimensions = explain?.dimensions ? Object.entries(explain.dimensions) : []

  return (
    <Card className={cn('overflow-hidden', isTop && 'border-indigo-300 shadow-md ring-1 ring-indigo-200')}>
      {isTop && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white">
          <IconSparkles className="h-4 w-4" /> Top recommendation
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <ProductImage
            src={rec.product.imageUrl}
            alt={rec.product.name}
            className="h-20 w-20 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {rec.rankPosition}
              </span>
              <h2 className="truncate text-lg font-bold text-slate-900">{rec.product.name}</h2>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              {rec.product.brand}
              {rec.product.model ? ` · ${rec.product.model}` : ''}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {rec.product.bestPrice != null && (
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(rec.product.bestPrice, rec.product.currency)}
                </span>
              )}
              {rec.budgetCategory && <Badge tone={statusTone(rec.budgetCategory)}>{rec.budgetCategory.replace(/_/g, ' ')}</Badge>}
              <Stars value={rec.product.avgRating} count={rec.product.reviewCount} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/products/${rec.product.slug}`}>
                <Button variant="outline" size="sm">
                  <IconExternal className="h-3.5 w-3.5" /> View product
                </Button>
              </Link>
              <Button variant="subtle" size="sm" onClick={bookmark} loading={busy === 'bookmark'}>
                <IconBookmark className="h-3.5 w-3.5" /> Save
              </Button>
              <Button
                variant={addedCompare ? 'ghost' : 'outline'}
                size="sm"
                onClick={addToCompare}
                loading={busy === 'compare'}
                disabled={addedCompare}
              >
                <IconScale className="h-3.5 w-3.5" /> {addedCompare ? 'In comparison' : 'Add to compare'}
              </Button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-center">
            <ScoreRing value={rec.overallScore} size={76} label="score" />
            <div className="text-center">
              <div className="text-xs text-slate-400">Confidence</div>
              <div className="text-sm font-semibold text-slate-700">{Math.round(rec.confidenceRating)}%</div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <ScoreBar label="Value for money" value={rec.valueScore} />
          <ScoreBar label="Feature match" value={rec.featureMatch} />
          <ScoreBar label="Performance" value={rec.performanceMatch} />
          <ScoreBar label="Review sentiment" value={rec.reviewSentiment} />
        </div>

        {explain && (
          <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
              <IconSparkles className="h-4 w-4" /> Why this product?
            </h3>
            {explain.summary && <p className="mt-1.5 text-sm text-indigo-900/80">{explain.summary}</p>}
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {explain.bestFeatures && explain.bestFeatures.length > 0 && (
                <ReasonList title="Strengths" tone="good" items={explain.bestFeatures} />
              )}
              {explain.weaknesses && explain.weaknesses.length > 0 && (
                <ReasonList title="Watch-outs" tone="warn" items={explain.weaknesses} />
              )}
            </div>
            {explain.dealBreakers && explain.dealBreakers.length > 0 && (
              <div className="mt-3">
                <ReasonList title="Deal-breakers" tone="bad" items={explain.dealBreakers} />
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {open ? 'Hide detailed breakdown' : 'Show detailed breakdown'}
          <IconChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="mt-4 space-y-5 border-t border-slate-100 pt-5">
            {dimensions.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">Factor-by-factor</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {dimensions.map(([key, dim]) => (
                    <div key={key} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize text-slate-700">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-bold text-slate-900">{Math.round(dim.score)}</span>
                      </div>
                      <ScoreBar value={dim.score} className="mt-1.5" />
                      <p className="mt-2 text-xs text-slate-500">{dim.detail}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                        {dim.verdict} · importance {Math.round(dim.importance)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {advantages.length > 0 && <ReasonList title="Advantages" tone="good" items={advantages} />}
              {disadvantages.length > 0 && <ReasonList title="Disadvantages" tone="bad" items={disadvantages} />}
              {tradeOffs.length > 0 && <ReasonList title="Trade-offs" tone="warn" items={tradeOffs} />}
              {dealBreakers.length > 0 && <ReasonList title="Deal-breakers" tone="bad" items={dealBreakers} />}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function ReasonList({ title, tone, items }: { title: string; tone: 'good' | 'warn' | 'bad'; items: string[] }) {
  const Icon = tone === 'good' ? IconThumbsUp : tone === 'warn' ? IconAlert : IconThumbsDown
  const color = tone === 'good' ? 'text-emerald-600' : tone === 'warn' ? 'text-amber-600' : 'text-rose-600'
  return (
    <div>
      <h4 className={cn('mb-1.5 flex items-center gap-1.5 text-sm font-semibold', color)}>
        <Icon className="h-4 w-4" /> {title}
      </h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-600">
            <IconCheck className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', color)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
