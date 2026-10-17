import { cn } from '../lib/cn'

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-extrabold tracking-tight text-slate-900', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-sm">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
          <path d="M12 3 4 7.5l8 4.5 8-4.5L12 3Z" fill="currentColor" />
          <path d="M4 12l8 4.5 8-4.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.7" />
          <path d="M4 16.5 12 21l8-4.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.4" />
        </svg>
      </span>
      {showText && <span className="text-lg">Think<span className="text-indigo-600">Stack</span></span>}
    </span>
  )
}
