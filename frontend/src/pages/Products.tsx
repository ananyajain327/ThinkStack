import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import type { ProductSummary, Category } from '../api/types'

export default function Products() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: any = { page, size: 12 }
    if (category) params.category = category
    api.get('/products', { params })
      .then(res => {
        const d = res.data.data
        setProducts(d.content || d)
        setTotalPages(d.totalPages || 1)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [category, page])

  const filtered = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      )
    : products

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Products</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(0) }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-600">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-contain mb-3"
                  />
                )}
                <p className="text-xs text-gray-500">{product.categoryName}</p>
                <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
                {product.bestPrice != null && (
                  <p className="mt-2 font-bold text-gray-900">
                    {product.currency} {product.bestPrice.toLocaleString()}
                  </p>
                )}
                {product.avgRating != null && (
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <span className="text-yellow-400">★</span>
                    <span>{product.avgRating.toFixed(1)}</span>
                    <span className="text-gray-400">({product.reviewCount})</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="px-3 py-1 text-gray-600">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
