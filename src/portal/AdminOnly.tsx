import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { usePortalSession } from './session';

/**
 * PRD §3.2: an Org Viewer never sees user management or billing.
 *
 * In the real portal this is enforced server-side before the view renders — a
 * hidden link is a convenience, not a control. The guard is here so the two
 * permission levels can be seen side by side during review.
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { role } = usePortalSession();

  if (role !== 'Org Admin') {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-shell text-ink-mute">
          <LockIcon className="h-4 w-4" />
        </span>
        <h1 className="mt-3 text-lg font-semibold text-ink">Not available for your account</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-soft">
          Team management and subscription details are available to Org Admins. Your organisation’s admin can help.
        </p>
        <Link
          to="/portal"
          className="mt-4 inline-block text-xs font-semibold text-accent-deep hover:underline">

          Back to published
        </Link>
      </div>);

  }

  return <>{children}</>;
}
