import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import { IconAlert, IconCheck, IconInfo, IconX } from './icons'

type ToastTone = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  tone: ToastTone
  title: string
  description?: string
}

interface ToastContextType {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = ++counter
      setToasts((list) => [...list, { id, tone, title, description }])
      window.setTimeout(() => dismiss(id), 5000)
    },
    [dismiss]
  )

  const value: ToastContextType = {
    success: (t, d) => push('success', t, d),
    error: (t, d) => push('error', t, d),
    info: (t, d) => push('info', t, d),
    warning: (t, d) => push('warning', t, d),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:bottom-auto sm:right-0 sm:top-0 sm:items-end">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const toneConfig: Record<ToastTone, { icon: ReactNode; ring: string; iconColor: string }> = {
  success: { icon: <IconCheck className="h-5 w-5" />, ring: 'ring-emerald-200', iconColor: 'text-emerald-600 bg-emerald-50' },
  error: { icon: <IconAlert className="h-5 w-5" />, ring: 'ring-rose-200', iconColor: 'text-rose-600 bg-rose-50' },
  warning: { icon: <IconAlert className="h-5 w-5" />, ring: 'ring-amber-200', iconColor: 'text-amber-600 bg-amber-50' },
  info: { icon: <IconInfo className="h-5 w-5" />, ring: 'ring-blue-200', iconColor: 'text-blue-600 bg-blue-50' },
}

function ToastCard({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  const cfg = toneConfig[t.tone]
  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg ring-1 animate-slide-up',
        cfg.ring
      )}
      role="status"
    >
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', cfg.iconColor)}>
        {cfg.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{t.title}</p>
        {t.description && <p className="mt-0.5 text-sm text-slate-500">{t.description}</p>}
      </div>
      <button onClick={onClose} className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Dismiss">
        <IconX className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
