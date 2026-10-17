import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import type { Category, ProductSummary } from '../api/types'
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
} from '../components/ui'
import { IconGrid, IconSearch } from '../components/icons'

type SortKey = 'rating' | 'priceAsc' | 'priceDesc' | 'name'

export default function Products() {
  const products = useAsync(() => get<ProductSummary[]>('/products', { params: { size: 100 } }), [])
  const categories = useAsync(() => get<Category[]>('/categories'), [])

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<SortKey>('rating')

  const list = useMemo(() => {
    let result = [...(products.data ?? [])]
    if (category) result = result.filter((p) => p.categorySlug === category)
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case 'priceAsc':
        result.sort((a, b) => (a.bestPrice ?? Infinity) - (b.bestPrice ?? Infinity))
        break
      case 'priceDesc':
        result.sort((a, b) => (b.bestPrice ?? -1) - (a.bestPrice ?? -1))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    }
    return result
  }, [products.data, category, search, sort])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Browse products</h1>
        <p className="mt-1 text-slate-500">Explore the catalogue and dive into the details.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products and brands…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="rating">Top rated</option>
            <option value="priceAsc">Price: low to high</option>
            <option value="priceDesc">Price: high to low</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <CategoryChip active={category === ''} onClick={() => setCategory('')} label="All" />
          {(categories.data ?? []).map((c) => (
            <CategoryChip
              key={c.slug}
              active={category === c.slug}
              onClick={() => setCategory(c.slug)}
              label={c.name}
            />
          ))}
        </div>
      </Card>

      {products.loading ? (
        <PageLoader label="Loading products…" />
      ) : products.error ? (
        <EmptyState title="Could not load products" description={products.error} action={<Button onClick={products.reload}>Retry</Button>} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<IconGrid className="h-6 w-6" />}
          title="No products found"
          description="Try a different search or category."
        />
      ) : (
        <>
          <p className="text-sm text-slate-500">{list.length} products</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="relative">
                  <ProductImage src={p.imageUrl} alt={p.name} className="h-40 w-full" rounded="rounded-none" />
                  {p.categoryName && (
                    <span className="absolute left-2 top-2">
                      <Badge tone="slate">{p.categoryName}</Badge>
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{p.brand}</p>
                  <h3 className="mt-1 line-clamp-2 flex-1 font-semibold text-slate-900">{p.name}</h3>
                  <div className="mt-2">
                    <Stars value={p.avgRating} count={p.reviewCount} />
                  </div>
                  {p.bestPrice != null && (
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {formatCurrency(p.bestPrice, p.currency)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CategoryChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
        active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      )}
    >
      {label}
    </button>
  )
}
