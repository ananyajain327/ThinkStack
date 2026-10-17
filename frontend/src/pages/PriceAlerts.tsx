import { Link } from 'react-router-dom'
import { get, del } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../components/Toast'
import type { PriceAlert } from '../api/types'
import { formatCurrency } from '../lib/format'
import { Badge, Button, EmptyState, PageLoader } from '../components/ui'
import { IconGrid, IconTarget, IconTrash } from '../components/icons'

export default function PriceAlerts() {
  const toast = useToast()
  const alerts = useAsync(() => get<PriceAlert[]>('/price-alerts'), [])

  const remove = async (id: string) => {
    try {
      await del(`/price-alerts/${id}`)
      toast.success('Alert removed')
      alerts.reload()
    } catch {
      toast.error('Could not remove alert')
    }
  }

  const list = alerts.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Price alerts</h1>
          <p className="mt-1 text-slate-500">We&apos;ll notify you when a product drops to your target price.</p>
        </div>
        <Link to="/products">
          <Button variant="outline">
            <IconGrid className="h-4 w-4" /> Browse products
          </Button>
        </Link>
      </div>

      {alerts.loading ? (
        <PageLoader label="Loading alerts…" />
      ) : alerts.error ? (
        <EmptyState title="Could not load alerts" description={alerts.error} action={<Button onClick={alerts.reload}>Retry</Button>} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<IconTarget className="h-6 w-6" />}
          title="No price alerts yet"
          description="Open any product and set a target price to start tracking."
          action={
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((alert) => {
            return (
              <div
                key={alert.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <IconTarget className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${alert.productSlug}`} className="truncate font-semibold text-slate-900 hover:text-indigo-600">
                    {alert.productName}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Target {formatCurrency(alert.targetPrice)}
                    {alert.currentBestPrice != null && <> · now {formatCurrency(alert.currentBestPrice)}</>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {alert.currentBestPrice != null && alert.currentBestPrice <= alert.targetPrice ? (
                    <Badge tone="emerald">Target reached</Badge>
                  ) : (
                    <Badge tone={alert.isActive ? 'indigo' : 'slate'}>{alert.isActive ? 'Active' : 'Paused'}</Badge>
                  )}
                  <button
                    onClick={() => remove(alert.id)}
                    className="rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete alert"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
