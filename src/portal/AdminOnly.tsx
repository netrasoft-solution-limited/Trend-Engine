import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { NoticeCard } from '../components/NoticeCard';
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
      <NoticeCard
        icon={LockIcon}
        title="Not available for your account"
        message="Team management and subscription details are available to Org Admins. Your organisation’s admin can help."
        action={
          <Link to="/portal" className="text-xs font-semibold text-accent-deep hover:underline">
            Back to published
          </Link>
        } />);


  }

  return <>{children}</>;
}
