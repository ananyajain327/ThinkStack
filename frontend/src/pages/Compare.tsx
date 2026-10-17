import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import type { ComparisonResponse } from '../api/types'

export default function Compare() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [data, setData] = useState<ComparisonResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [includeAlternatives, setIncludeAlternatives] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    const url = includeAlternatives
      ? `/decisions/${sessionId}/compare/alternatives`
      : `/decisions/${sessionId}/compare`
    setLoading(true)
    api.get(url)
      .then(res => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [sessionId, includeAlternatives])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading comparison...</div>
  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-500">No comparison data available</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
          <Link to={`/decisions/${sessionId}/recommendations`} className="text-sm text-indigo-600 hover:text-indigo-800">
            ← Back to Recommendations
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
            <p className="mt-1 text-gray-600">{data.categoryName}</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={includeAlternatives}
              onChange={(e) => setIncludeAlternatives(e.target.checked)}
              className="rounded"
            />
            Include my alternatives
          </label>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-medium text-gray-500 sticky left-0 bg-white min-w-[150px]">
                  Specification
                </th>
                {data.items.map((item) => (
                  <th key={item.productId} className="p-4 text-center min-w-[180px]">
                    <div className="font-bold text-gray-900">{item.product.name}</div>
                    <div className="text-sm text-gray-600">{item.product.brand}</div>
                    {item.product.bestPrice != null && (
                      <div className="mt-1 text-sm font-semibold text-indigo-600">
                        {item.product.currency} {item.product.bestPrice.toLocaleString()}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-500">
                      Score: {item.overallScore.toFixed(1)} · Rank #{item.rank}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.specRows.map((row) => (
                <tr key={row.specKey} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                    {row.specName}
                    {row.unit && <span className="text-gray-400 ml-1">({row.unit})</span>}
                  </td>
                  {data.items.map((item) => {
                    const cell = row.cells.find(c => c.productId === item.productId)
                    return (
                      <td key={item.productId} className="p-4 text-center text-sm text-gray-900">
                        {cell?.displayValue || '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.items.some(i => i.sellers.length > 0) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.items.map((item) => (
                <div key={item.productId} className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                  <div className="mt-3 space-y-2">
                    {item.sellers.map((seller) => (
                      <div key={seller.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{seller.sellerName}</span>
                        <div className="text-right">
                          <span className="font-medium text-gray-900">
                            {seller.currency} {seller.price.toLocaleString()}
                          </span>
                          {seller.discountPercentage && (
                            <span className="ml-1 text-green-600 text-xs">
                              -{seller.discountPercentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
