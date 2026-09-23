import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { NoticeCard } from '../components/NoticeCard';
import { useOpsSession } from './session';

/**
 * PRD §3.2: tenant onboarding and cross-org subscription status are a
 * Platform Admin capability, not an Operator one, even though both roles
 * share the operator plane. Server-side enforcement is what a real backend
 * would decide before rendering; this guard is the design reference for it.
 */
export function PlatformAdminOnly({ children }: { children: React.ReactNode }) {
  const { role } = useOpsSession();

  if (role !== 'Platform Admin') {
    return (
      <NoticeCard
        icon={LockIcon}
        title="Not available for your role"
        message="Tenant onboarding and organisation management are available to Platform Admins. Ask a platform admin for access."
        action={
          <Link to="/ops" className="text-xs font-semibold text-accent-deep hover:underline">
            Back to triage
          </Link>
        } />);

  }

  return <>{children}</>;
}
