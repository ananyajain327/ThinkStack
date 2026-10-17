import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { get } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import type { ComparisonResponse } from '../api/types'
import { formatCurrency } from '../lib/format'
import { cn } from '../lib/cn'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageLoader,
  ProductImage,
  Stars,
  Tabs,
} from '../components/ui'
import { IconArrowLeft, IconExternal, IconScale } from '../components/icons'

export default function Compare() {
  const { sessionId = '' } = useParams<{ sessionId: string }>()
  const [includeAlternatives, setIncludeAlternatives] = useState(false)
  const [tab, setTab] = useState<'specs' | 'prices'>('specs')

  const data = useAsync(async () => {
    const url = includeAlternatives
      ? `/decisions/${sessionId}/compare/alternatives`
      : `/decisions/${sessionId}/compare`
    return get<ComparisonResponse>(url)
  }, [sessionId, includeAlternatives])

  if (data.loading) return <PageLoader label="Building comparison…" />
  if (data.error || !data.data) {
    return (
      <EmptyState
        title="No comparison data"
        description={data.error ?? 'Generate recommendations first, then compare.'}
        action={
          <Link to={`/decisions/${sessionId}/recommendations`}>
            <Button>Back to recommendations</Button>
          </Link>
        }
      />
    )
  }

  const { items, specRows, categoryName } = data.data
  const bestPriceId = items.reduce<string | null>((best, item) => {
    const price = item.product.bestPrice
    if (price == null) return best
    if (best == null) return item.productId
    const bestItem = items.find((i) => i.productId === best)
    return bestItem?.product.bestPrice == null || price < bestItem.product.bestPrice ? item.productId : best
  }, null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to={`/decisions/${sessionId}/recommendations`}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <IconArrowLeft className="h-4 w-4" /> Back to recommendations
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Compare products</h1>
          <p className="mt-1 text-slate-500">{categoryName}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={includeAlternatives}
            onChange={(e) => setIncludeAlternatives(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Include my alternatives
        </label>
      </div>

      <Tabs
        tabs={[
          { value: 'specs', label: 'Specifications' },
          { value: 'prices', label: 'Prices' },
        ]}
        value={tab}
        onChange={setTab}
        className="max-w-xs"
      />

      {tab === 'specs' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 min-w-[160px] border-b border-slate-200 bg-slate-50 p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Specification
                  </th>
                  {items.map((item) => (
                    <th key={item.productId} className="min-w-[200px] border-b border-l border-slate-200 bg-slate-50 p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ProductImage src={item.product.imageUrl} alt={item.product.name} className="h-14 w-14" />
                        <Link to={`/products/${item.product.slug}`} className="font-bold text-slate-900 hover:text-indigo-600">
                          {item.product.name}
                        </Link>
                        <span className="text-xs text-slate-500">{item.product.brand}</span>
                        {item.product.bestPrice != null && (
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                            {formatCurrency(item.product.bestPrice, item.product.currency)}
                            {bestPriceId === item.productId && <Badge tone="emerald">Best price</Badge>}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <Stars value={item.product.avgRating} count={item.product.reviewCount} size={12} />
                        </div>
                        {item.overallScore != null && (
                          <span className="text-xs text-slate-500">
                            Score {item.overallScore.toFixed(1)}
                            {item.rank != null ? ` · Rank #${item.rank}` : ''}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specRows.map((row, idx) => (
                  <tr key={row.keyName ?? idx} className={cn(idx % 2 === 1 && 'bg-slate-50/50')}>
                    <td className="sticky left-0 z-10 border-b border-slate-100 bg-white p-4 text-sm font-medium text-slate-700">
                      {row.name}
                      {row.unit && <span className="ml-1 text-slate-400">({row.unit})</span>}
                    </td>
                    {items.map((item) => {
                      const cell = row.cells.find((c) => c.productId === item.productId)
                      return (
                        <td key={item.productId} className="border-b border-l border-slate-100 p-4 text-center text-sm text-slate-600">
                          {cell?.displayValue ?? <span className="text-slate-300">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'prices' && (
        <div>
          {items.every((i) => (i.prices ?? []).length === 0) ? (
            <EmptyState title="No seller prices available" description="We could not find live prices for these products." />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.productId} className="p-5">
                  <div className="flex items-center gap-3">
                    <ProductImage src={item.product.imageUrl} alt={item.product.name} className="h-12 w-12" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.product.name}</p>
                      <p className="text-xs text-slate-500">{item.product.brand}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {(item.prices ?? []).map((seller) => (
                      <div key={seller.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                        <span className="truncate text-slate-600">{seller.sellerName}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <span className="font-medium text-slate-900">{formatCurrency(seller.price, seller.currency)}</span>
                          {seller.discountPercentage ? (
                            <Badge tone="emerald">-{Math.round(seller.discountPercentage)}%</Badge>
                          ) : null}
                          {seller.sellerUrl && (
                            <a
                              href={seller.sellerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-700"
                              aria-label="Open seller"
                            >
                              <IconExternal className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {items.length === 0 && (
        <EmptyState icon={<IconScale className="h-6 w-6" />} title="Nothing to compare yet" />
      )}
    </div>
  )
}
