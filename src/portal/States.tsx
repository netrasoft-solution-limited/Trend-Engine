import { InboxIcon } from 'lucide-react';

/**
 * The three states the mock portal never had, because it had nothing to load.
 * Shared so that every screen fails and empties the same way.
 */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-5 py-10 text-center" aria-busy="true">
      <p className="text-sm text-ink-mute">{label}</p>
    </div>);

}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-bad/30 bg-card px-5 py-8 text-center">
      <p className="text-sm font-semibold text-ink">We couldn't load this</p>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-ink-soft">{error.message}</p>
      {onRetry &&
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">
        
          Try again
        </button>
      }
    </div>);

}

export function Empty({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-5 py-10 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-shell text-ink-mute">
        <InboxIcon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      {detail && <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-ink-soft">{detail}</p>}
    </div>);

}
