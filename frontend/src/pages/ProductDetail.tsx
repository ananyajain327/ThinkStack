import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { apiErrorMessage } from '../api/client'
import { get, post } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../components/Toast'
import type { PriceHistoryPoint, ProductDetail as ProductDetailModel, ReviewResponse } from '../api/types'
import { formatCurrency, formatDate } from '../lib/format'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  PageLoader,
  ProductImage,
  Stars,
  Tabs,
} from '../components/ui'
import {
  IconArrowLeft,
  IconBell,
  IconBookmark,
  IconExternal,
  IconTarget,
  IconThumbsUp,
} from '../components/icons'

export default function ProductDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const toast = useToast()
  const product = useAsync(() => get<ProductDetailModel>(`/products/${slug}`), [slug])
  const history = useAsync(() => get<PriceHistoryPoint[]>(`/products/${slug}/price-history`), [slug])

  const [tab, setTab] = useState<'specs' | 'prices' | 'history' | 'reviews'>('specs')
  const [alertOpen, setAlertOpen] = useState(false)
  const [targetPrice, setTargetPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  if (product.loading) return <PageLoader label="Loading product…" />
  if (product.error || !product.data) {
    return (
      <EmptyState
        title="Product not found"
        description={product.error ?? 'This product may have been removed.'}
        action={<Link to="/products"><Button>Back to products</Button></Link>}
      />
    )
  }

  const p = product.data
  const points = [...(history.data ?? [])].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  )
  const prices = points.map((pt) => pt.price)
  const min = prices.length ? Math.min(...prices) : undefined
  const max = prices.length ? Math.max(...prices) : undefined
  const sentimentTone = (s?: string) => (s === 'POSITIVE' ? 'emerald' : s === 'NEGATIVE' ? 'rose' : 'slate')

  const openAlert = () => {
    setTargetPrice(p.bestPrice ? String(Math.round(p.bestPrice * 0.9)) : '')
    setAlertOpen(true)
  }

  const createAlert = async () => {
    const value = Number(targetPrice)
    if (!value || value <= 0) {
      toast.error('Enter a valid target price')
      return
    }
    setSaving(true)
    try {
      await post('/price-alerts', { productId: p.id, targetPrice: value })
      setAlertOpen(false)
      toast.success('Price alert created', `We will notify you when it drops to ${formatCurrency(value, p.currency)}`)
    } catch (err) {
      toast.error('Could not create alert', apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const bookmark = async () => {
    try {
      await post('/bookmarks', { bookmarkType: 'PRODUCT', productId: p.id })
      setBookmarked(true)
      toast.success('Saved to bookmarks')
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
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <IconArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          <ProductImage src={p.imageUrl} alt={p.name} className="h-44 w-full shrink-0 sm:w-56" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500">{p.categoryName}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{p.name}</h1>
            <p className="mt-1 text-slate-600">
              {p.brand}
              {p.model ? ` · ${p.model}` : ''}
            </p>
            <div className="mt-2">
              <Stars value={p.avgRating} count={p.reviewCount} />
            </div>
            {p.description && <p className="mt-4 text-sm leading-relaxed text-slate-600">{p.description}</p>}

            <div className="mt-5 flex flex-wrap items-end gap-4">
              {p.bestPrice != null && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Best price</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(p.bestPrice, p.currency)}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="subtle" size="sm" onClick={openAlert}>
                  <IconBell className="h-4 w-4" /> Set price alert
                </Button>
                <Button variant={bookmarked ? 'ghost' : 'outline'} size="sm" onClick={bookmark} disabled={bookmarked}>
                  <IconBookmark className="h-4 w-4" /> {bookmarked ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'specs', label: 'Specifications', count: p.specifications.length },
          { value: 'prices', label: 'Prices', count: p.prices.length },
          { value: 'history', label: 'Price history', count: points.length },
          { value: 'reviews', label: 'Reviews', count: p.reviews.length },
        ]}
        className="max-w-2xl"
      />

      {tab === 'specs' && (
        <Card className="divide-y divide-slate-100">
          {p.specifications.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No specifications available.</p>
          ) : (
            p.specifications.map((spec) => (
              <div key={spec.specDefId} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-slate-700">{spec.name}</span>
                  {spec.explanation && <p className="mt-0.5 max-w-xl text-xs text-slate-400">{spec.explanation}</p>}
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-900">
                  {spec.displayValue ?? spec.textValue ?? (spec.numericValue != null ? `${spec.numericValue}${spec.unit ? ` ${spec.unit}` : ''}` : '—')}
                </span>
              </div>
            ))
          )}
        </Card>
      )}

      {tab === 'prices' && (
        <div className="space-y-3">
          {p.prices.length === 0 ? (
            <EmptyState title="No prices available" description="We could not find sellers for this product." />
          ) : (
            p.prices.map((seller) => (
            <Card key={seller.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{seller.sellerName}</p>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  {seller.availability && <span>{seller.availability}</span>}
                  {seller.deliveryInformation && <span>· {seller.deliveryInformation}</span>}
                  {seller.warrantyInformation && <span>· {seller.warrantyInformation}</span>}
                  {seller.sellerRating != null && (
                    <span className="inline-flex items-center gap-1">
                      <IconThumbsUp className="h-3 w-3" /> {seller.sellerRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-right">
                  {seller.discountPercentage ? (
                    <Badge tone="emerald">-{Math.round(seller.discountPercentage)}%</Badge>
                  ) : null}
                  <span className="block text-lg font-bold text-slate-900">{formatCurrency(seller.price, seller.currency)}</span>
                </span>
                {seller.sellerUrl && (
                  <a href={seller.sellerUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">
                      Visit <IconExternal className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          ))
          )}
        </div>
      )}

      {tab === 'history' && (
        <Card className="p-5 sm:p-6">
          {points.length === 0 ? (
            <EmptyState title="No price history" description="Price tracking data is not available for this product yet." />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-6 text-sm">
                <span className="text-slate-500">Lowest <span className="font-semibold text-emerald-600">{formatCurrency(min, p.currency)}</span></span>
                <span className="text-slate-500">Highest <span className="font-semibold text-rose-600">{formatCurrency(max, p.currency)}</span></span>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={points}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis
                    dataKey="recordedAt"
                    tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    fontSize={12}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    fontSize={12}
                    stroke="#94a3b8"
                    tickFormatter={(v) => Number(v).toLocaleString()}
                    domain={['auto', 'auto']}
                    width={70}
                  />
                  <Tooltip
                    labelFormatter={(v) => formatDate(String(v))}
                    formatter={(v) => [formatCurrency(Number(v), p.currency), 'Price']}
                  />
                  <Line type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          {p.reviews.length === 0 ? (
            <EmptyState title="No reviews yet" description="Be the first to share your experience." />
          ) : (
            p.reviews.map((review) => <ReviewCard key={review.id} review={review} toneFn={sentimentTone} />)
          )}
        </div>
      )}

      <Modal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Set a price alert"
        size="sm"
      >
        <p className="text-sm text-slate-500">
          We&apos;ll notify you when the best price for <span className="font-medium text-slate-700">{p.name}</span> drops to
          your target.
        </p>
        {p.bestPrice != null && (
          <p className="mt-1 text-sm text-slate-500">
            Current best: <span className="font-semibold text-slate-800">{formatCurrency(p.bestPrice, p.currency)}</span>
          </p>
        )}
        <Field label="Target price" className="mt-4">
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="e.g. 60000"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>
          <Button onClick={createAlert} loading={saving}>
            <IconTarget className="h-4 w-4" /> Create alert
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function ReviewCard({ review, toneFn }: { review: ReviewResponse; toneFn: (s?: string) => string }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {review.title && <h3 className="font-semibold text-slate-900">{review.title}</h3>}
          <p className="mt-0.5 text-xs text-slate-500">
            {review.authorName ?? 'Anonymous'}
            {review.source ? ` · ${review.source}` : ''}
            {review.verifiedPurchase ? ' · verified' : ''}
            {review.reviewDate ? ` · ${formatDate(review.reviewDate)}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Stars value={review.rating} />
          {review.sentiment && <Badge tone={toneFn(review.sentiment)}>{review.sentiment.toLowerCase()}</Badge>}
        </div>
      </div>
      {review.content && <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.content}</p>}
      {review.helpfulCount ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <IconThumbsUp className="h-3.5 w-3.5" /> {review.helpfulCount} found this helpful
        </p>
      ) : null}
    </Card>
  )
}
