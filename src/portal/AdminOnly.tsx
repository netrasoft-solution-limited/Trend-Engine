import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { isOrgAdmin, usePortalSession } from './session';

/**
 * PRD §3.2: an Org Viewer never sees user management or billing.
 *
 * THIS IS NOT THE CONTROL. The server returns 403 for `/portal/api/team` and
 * `/portal/api/subscription` to any session whose active membership is not an
 * Org Admin, and it does so from the membership the middleware verified —
 * never from anything the client sent. This component only spares a viewer a
 * screen full of failed requests.
 *
 * It matters that the two agree, but if they ever disagree the server wins.
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const session = usePortalSession();

  if (!isOrgAdmin(session)) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-shell text-ink-mute">
          <LockIcon className="h-4 w-4" />
        </span>
        <h1 className="mt-3 text-lg font-semibold text-ink">Not available for your account</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-soft">
          Team management and subscription details are available to Org Admins. Your organisation's
          admin can help.
        </p>
        <Link to="/portal" className="mt-4 inline-block text-xs font-semibold text-accent-deep hover:underline">
          Back to published
        </Link>
      </div>);

  }

  return <>{children}</>;
}
