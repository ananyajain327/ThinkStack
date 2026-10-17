import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import type { ProductSummary, PriceResponse } from '../api/types'

interface SpecValue {
  specName: string
  specValue: string
  specUnit?: string
  specGroup?: string
}

interface Review {
  id: string
  sourceName?: string
  rating?: number
  title?: string
  reviewText?: string
  reviewType?: string
}

interface ProductDetail extends ProductSummary {
  description?: string
  specifications: SpecValue[]
  prices: PriceResponse[]
  reviews: Review[]
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'specs' | 'prices' | 'reviews'>('specs')

  useEffect(() => {
    if (!slug) return
    api.get(`/products/${slug}`)
      .then(res => setProduct(res.data.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500">Product not found</div>

  const specGroups = product.specifications.reduce<Record<string, SpecValue[]>>((acc, spec) => {
    const group = spec.specGroup || 'General'
    if (!acc[group]) acc[group] = []
    acc[group].push(spec)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-xl border border-gray-200 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">{product.categoryName}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
              <p className="mt-1 text-gray-600">{product.brand} {product.model}</p>
              {product.avgRating != null && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-yellow-400">★</span>
                  <span className="font-medium">{product.avgRating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({product.reviewCount} reviews)</span>
                </div>
              )}
            </div>
            <div className="text-right">
              {product.bestPrice != null && (
                <div className="text-2xl font-bold text-gray-900">
                  {product.currency} {product.bestPrice.toLocaleString()}
                </div>
              )}
            </div>
          </div>
          {product.description && (
            <p className="mt-4 text-gray-700">{product.description}</p>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {(['specs', 'prices', 'reviews'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                tab === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {t === 'specs' ? 'Specifications' : t === 'prices' ? 'Prices' : `Reviews (${product.reviews.length})`}
            </button>
          ))}
        </div>

        {tab === 'specs' && (
          <div className="space-y-6">
            {Object.entries(specGroups).map(([group, specs]) => (
              <div key={group} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{group}</h3>
                <div className="divide-y divide-gray-100">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex justify-between py-2">
                      <span className="text-gray-600">{spec.specName}</span>
                      <span className="font-medium text-gray-900">
                        {spec.specValue}{spec.specUnit ? ` ${spec.specUnit}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'prices' && (
          <div className="space-y-3">
            {product.prices.map((price) => (
              <div key={price.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{price.sellerName}</p>
                  {price.availability && <p className="text-sm text-gray-500">{price.availability}</p>}
                  {price.deliveryInformation && <p className="text-sm text-gray-500">{price.deliveryInformation}</p>}
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {price.currency} {price.price.toLocaleString()}
                  </div>
                  {price.discountPercentage && (
                    <div className="text-sm text-green-600">-{price.discountPercentage.toFixed(0)}%</div>
                  )}
                  <a
                    href={price.sellerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-4">
            {product.reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reviews yet.</p>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex justify-between">
                    <div>
                      {review.title && <h4 className="font-semibold text-gray-900">{review.title}</h4>}
                      <p className="text-sm text-gray-500 mt-1">
                        {review.sourceName} · {review.reviewType}
                      </p>
                    </div>
                    {review.rating != null && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} className={i <= review.rating! ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {review.reviewText && (
                    <p className="mt-3 text-sm text-gray-700">{review.reviewText}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
