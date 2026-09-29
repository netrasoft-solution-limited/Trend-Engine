import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangleIcon, CheckCircle2Icon, RotateCcwIcon } from 'lucide-react';
import { AuthShell } from '../AuthShell';
import { getCsrfToken } from '../api/csrf';
import { verifyEmail } from '../api/verifyEmail';

type VerifyState = 'checking' | 'success' | 'invalid';

const TITLES: Record<VerifyState, string> = {
  checking: 'Verifying your email',
  success: 'Email verified',
  invalid: "That link isn't valid"
};

export function VerifyEmail() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>('checking');

  useEffect(() => {
    let cancelled = false;
    getCsrfToken()
      .then(({ csrfToken }) => verifyEmail(token, csrfToken))
      .then(() => {
        if (cancelled) return;
        setState('success');
      })
      .catch(() => {
        // The backend collapses invalid/expired/already-used into one
        // identical response — there is no server-provided distinction left
        // to surface here, so this is deliberately a single catch-all state.
        if (cancelled) return;
        setState('invalid');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (state !== 'success') return;
    const id = setTimeout(() => navigate('/portal/login', { replace: true }), 900);
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
          Your organisation is active. Redirecting you to sign in…
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
    </AuthShell>);

}
