import { useState } from 'react'
import { Link } from 'react-router-dom'
import { get, del } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../components/Toast'
import type { BookmarkItem } from '../api/types'
import { formatCurrency } from '../lib/format'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageLoader,
  ProductImage,
  Stars,
  Tabs,
  statusTone,
} from '../components/ui'
import { IconBookmark, IconTrash } from '../components/icons'

type Filter = 'all' | 'product' | 'session'

export default function Bookmarks() {
  const toast = useToast()
  const bookmarks = useAsync(() => get<BookmarkItem[]>('/bookmarks'), [])
  const [filter, setFilter] = useState<Filter>('all')

  const all = bookmarks.data ?? []
  const productCount = all.filter((b) => b.bookmarkType === 'PRODUCT').length
  const sessionCount = all.filter((b) => b.bookmarkType === 'SESSION').length
  const list = all.filter((b) =>
    filter === 'all' ? true : filter === 'product' ? b.bookmarkType === 'PRODUCT' : b.bookmarkType === 'SESSION'
  )

  const remove = async (id: string) => {
    try {
      await del(`/bookmarks/${id}`)
      toast.success('Bookmark removed')
      bookmarks.reload()
    } catch {
      toast.error('Could not remove bookmark')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bookmarks</h1>
        <p className="mt-1 text-slate-500">Products and decisions you have saved for later.</p>
      </div>

      <Tabs
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'all', label: 'All', count: all.length },
          { value: 'product', label: 'Products', count: productCount },
          { value: 'session', label: 'Decisions', count: sessionCount },
        ]}
        className="max-w-md"
      />

      {bookmarks.loading ? (
        <PageLoader />
      ) : bookmarks.error ? (
        <EmptyState title="Could not load bookmarks" description={bookmarks.error} action={<Button onClick={bookmarks.reload}>Retry</Button>} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<IconBookmark className="h-6 w-6" />}
          title="Nothing saved yet"
          description="Save products or decisions to find them here quickly."
          action={
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((bm) => (
            <Card key={bm.id} className="flex flex-wrap items-center gap-4 p-4">
              {bm.bookmarkType === 'PRODUCT' && bm.product && (
                <>
                  <ProductImage src={bm.product.imageUrl} alt={bm.product.name} className="h-14 w-14" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{bm.product.brand}</p>
                    <Link to={`/products/${bm.product.slug}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                      {bm.product.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      {bm.product.bestPrice != null && (
                        <span className="text-sm font-semibold text-slate-800">
                          {formatCurrency(bm.product.bestPrice)}
                        </span>
                      )}
                      <Stars value={bm.product.avgRating} count={bm.product.reviewCount} />
                    </div>
                  </div>
                </>
              )}

              {bm.bookmarkType === 'SESSION' && bm.session && (
                <>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                    {bm.session.title.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/decisions/${bm.session.id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                      {bm.session.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge tone="slate">{bm.session.categorySlug}</Badge>
                      <Badge tone={statusTone(bm.session.status)}>{bm.session.status.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => remove(bm.id)}
                className="ml-auto rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Remove bookmark"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
