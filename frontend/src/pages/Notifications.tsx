import { useState } from 'react'
import { get, post, del } from '../api/rest'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../components/Toast'
import type { NotificationItem } from '../api/types'
import { timeAgo } from '../lib/format'
import { cn } from '../lib/cn'
import { NOTIFICATIONS_CHANGED } from '../lib/events'
import { Button, EmptyState, PageLoader, Tabs } from '../components/ui'
import {
  IconBell,
  IconBook,
  IconCompass,
  IconSparkles,
  IconTarget,
  IconX,
} from '../components/icons'

const typeIcon: Record<string, typeof IconBell> = {
  PRICE_DROP: IconTarget,
  PRICE_ALERT: IconTarget,
  DECISION: IconCompass,
  DECISION_REMINDER: IconCompass,
  RECOMMENDATION: IconSparkles,
  JOURNAL: IconBook,
  SYSTEM: IconBell,
}

export default function Notifications() {
  const toast = useToast()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const list = useAsync(async () => {
    const items = await get<NotificationItem[]>('/notifications', {
      params: filter === 'unread' ? { unreadOnly: true } : undefined,
    })
    return items ?? []
  }, [filter])

  const items = list.data ?? []
  const unreadCount = items.filter((n) => !n.isRead).length

  const markAllRead = async () => {
    try {
      await post('/notifications/read-all')
      list.reload()
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Could not update notifications')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
          <p className="mt-1 text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread', count: filter === 'all' ? unreadCount : undefined },
        ]}
        className="max-w-xs"
      />

      {list.loading ? (
        <PageLoader />
      ) : list.error ? (
        <EmptyState title="Could not load notifications" description={list.error} action={<Button onClick={list.reload}>Retry</Button>} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconBell className="h-6 w-6" />}
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description="Price drops and decision updates will appear here."
        />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <NotificationRow key={n.id} notification={n} onChanged={list.reload} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationRow({ notification: n, onChanged }: { notification: NotificationItem; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const Icon = typeIcon[n.type] ?? IconBell

  const refresh = () => {
    onChanged()
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))
  }

  const markRead = async () => {
    setBusy(true)
    try {
      await post(`/notifications/${n.id}/read`)
      refresh()
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await del(`/notifications/${n.id}`)
      refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm transition',
        n.isRead ? 'border-slate-200' : 'border-indigo-200 bg-indigo-50/40'
      )}
    >
      <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', n.isRead ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-600')}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm', n.isRead ? 'text-slate-700' : 'font-semibold text-slate-900')}>{n.title}</p>
        {n.body && <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>}
        <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!n.isRead && (
          <Button variant="ghost" size="sm" onClick={markRead} disabled={busy}>
            Mark read
          </Button>
        )}
        <button
          onClick={remove}
          disabled={busy}
          className="rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
          aria-label="Delete notification"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
