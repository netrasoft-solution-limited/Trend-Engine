import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangleIcon, CheckCircle2Icon, ClockIcon, RotateCcwIcon } from 'lucide-react';
import { AuthShell } from '../AuthShell';
import { usePortalAuth } from '../auth/PortalAuthContext';
import { portalAuthService, PortalAuthError } from '../auth/authService';

type VerifyState = 'checking' | 'success' | 'invalid' | 'expired' | 'used';

const TITLES: Record<VerifyState, string> = {
  checking: 'Verifying your email',
  success: 'Email verified',
  invalid: "That link isn't valid",
  expired: 'That link has expired',
  used: 'Already verified'
};

export function VerifyEmail() {
  const { token = '' } = useParams();
  const auth = usePortalAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>('checking');
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    portalAuthService
      .verifyEmail(token)
      .then((result) => {
        if (cancelled) return;
        auth.completeVerification(result.user);
        setState('success');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof PortalAuthError) {
          setState(err.code === 'expired_token' ? 'expired' : err.code === 'already_used' ? 'used' : 'invalid');
          if (err.email) setRecoveryEmail(err.email);
        } else {
          setState('invalid');
        }
      });
    return () => {
      cancelled = true;
    };
    // Deliberately scoped to `token` alone — `auth` changes identity on every
    // successful sign-in this effect itself causes, and re-running it then
    // would re-verify (and, for the demo tokens, re-mutate) forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (state !== 'success') return;
    const id = setTimeout(() => navigate('/portal', { replace: true }), 900);
    return () => clearTimeout(id);
  }, [state, navigate]);

  return (
    <AuthShell eyebrow="Verify email" title={TITLES[state]}>
      {state === 'checking' && (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <RotateCcwIcon className="h-4 w-4 animate-spin" />
          Checking your link…
        </p>
      )}

      {state === 'success' && (
        <div className="flex items-center gap-2 rounded-xl border border-ok/35 bg-ok-soft px-3.5 py-3 text-sm text-ok">
          <CheckCircle2Icon className="h-4 w-4 shrink-0" />
          Your organisation is active. Signing you in…
        </div>
      )}

      {state === 'invalid' && (
        <div className="space-y-3">
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
            <p className="text-xs leading-relaxed text-ink">This verification link isn’t recognised. It may have been mistyped or already replaced by a newer one.</p>
          </div>
          <Link to="/portal/sign-up" className="text-xs font-semibold text-accent-deep hover:underline">
            Start sign-up again
          </Link>
        </div>
      )}

      {state === 'expired' && (
        <div className="space-y-3">
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-warn/40 bg-warn-soft px-3.5 py-3">
            <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            <p className="text-xs leading-relaxed text-ink">Verification links expire after a few days. Request a new one and it’ll work the same way.</p>
          </div>
          <Link
            to={recoveryEmail ? `/portal/check-email?email=${encodeURIComponent(recoveryEmail)}` : '/portal/check-email'}
            className="text-xs font-semibold text-accent-deep hover:underline">

            Request a new link
          </Link>
        </div>
      )}

      {state === 'used' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-line bg-shell px-3.5 py-3">
            <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute" />
            <p className="text-xs leading-relaxed text-ink-soft">This link has already been used. If you already finished sign-up, sign in instead.</p>
          </div>
          <Link to="/portal/login" className="text-xs font-semibold text-accent-deep hover:underline">
            Sign in
          </Link>
        </div>
      )}
    </AuthShell>);

}
