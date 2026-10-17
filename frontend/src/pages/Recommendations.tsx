import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import type { Recommendation, DecisionSession } from '../api/types'

function parseJson(raw: string | null): any {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

function ScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StringList({ data }: { data: any }) {
  if (!data) return null
  let items: string[] = []
  if (Array.isArray(data)) items = data.map(String)
  else if (typeof data === 'object') items = Object.values(data).map(String)
  else items = [String(data)]
  if (items.length === 0) return null
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-700 flex gap-2">
          <span className="text-indigo-500">•</span> {item}
        </li>
      ))}
    </ul>
  )
}

export default function Recommendations() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [session, setSession] = useState<DecisionSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    Promise.all([
      api.get(`/decisions/${sessionId}`).then(res => setSession(res.data.data)).catch(() => {}),
      api.get(`/decisions/${sessionId}/recommendations`).then(res => setRecs(res.data.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [sessionId])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Analyzing options...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
          <div className="flex gap-3">
            <Link to={`/decisions/${sessionId}/compare`} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Compare Side by Side
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
          {session && (
            <p className="mt-1 text-gray-600">
              For: <span className="font-medium">{session.title}</span> ({session.categoryName})
            </p>
          )}
        </div>

        {recs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-600">No recommendations yet. Complete the wizard first.</p>
            <Link to={`/decisions/${sessionId}/wizard`} className="mt-4 inline-block text-indigo-600 font-medium">
              Go to Wizard →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {recs.map((rec) => {
              const isTop = rec.rankPosition === 1
              const isOpen = expanded === rec.id
              const explain = parseJson(rec.explainability)
              const tradeOffs = parseJson(rec.tradeOffs)
              const breakdown = parseJson(rec.scoreBreakdown)

              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-xl border-2 overflow-hidden ${
                    isTop ? 'border-indigo-600 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  {isTop && (
                    <div className="bg-indigo-600 text-white px-6 py-2 text-sm font-medium">
                      🏆 Top Recommendation
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-400">#{rec.rankPosition}</span>
                          <h2 className="text-xl font-bold text-gray-900">{rec.product.name}</h2>
                        </div>
                        <p className="mt-1 text-gray-600">{rec.product.brand} {rec.product.model}</p>
                        {rec.product.bestPrice != null && (
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {rec.product.currency} {rec.product.bestPrice.toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">
                          {rec.overallScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">Overall Score</div>
                        <div className="mt-1 text-sm text-gray-600">
                          Confidence: {rec.confidenceRating.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ScoreBar label="Value for Money" value={rec.valueScore} />
                      <ScoreBar label="Feature Match" value={rec.featureMatch} />
                      <ScoreBar label="Performance" value={rec.performanceMatch} />
                      <ScoreBar label="Review Sentiment" value={rec.reviewSentiment} />
                    </div>

                    {explain && (
                      <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-indigo-900 mb-2">Why this product?</h3>
                        <div className="text-sm text-indigo-800 space-y-1">
                          {typeof explain.reasons === 'string' && <p>{explain.reasons}</p>}
                          {Array.isArray(explain.reasons) && explain.reasons.map((r: string, i: number) => (
                            <p key={i}>• {r}</p>
                          ))}
                          {explain.summary && <p className="mt-2 font-medium">{explain.summary}</p>}
                          {!explain.reasons && !explain.summary && <p>{JSON.stringify(explain)}</p>}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setExpanded(isOpen ? null : rec.id)}
                      className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {isOpen ? 'Show less ▲' : 'Show detailed breakdown ▼'}
                    </button>

                    {isOpen && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                        <div>
                          <h4 className="font-medium text-green-700 mb-2">Advantages</h4>
                          <StringList data={parseJson(rec.advantages)} />
                        </div>
                        <div>
                          <h4 className="font-medium text-red-700 mb-2">Disadvantages</h4>
                          <StringList data={parseJson(rec.disadvantages)} />
                        </div>
                        {tradeOffs && (
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-yellow-700 mb-2">Trade-offs</h4>
                            <StringList data={tradeOffs} />
                          </div>
                        )}
                        {breakdown && (
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-gray-700 mb-2">Score Breakdown</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(breakdown).map(([key, val]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-lg text-center">
                                  <div className="text-lg font-bold text-gray-900">{Number(val).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500 capitalize">{key}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
