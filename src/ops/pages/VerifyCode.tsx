import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, ClockIcon, RotateCcwIcon } from 'lucide-react';
import { AuthShell } from '../AuthShell';
import { useOpsAuth } from '../auth/OpsAuthContext';
import { OpsAuthError, opsAuthService, OPS_DEMO_CODE } from '../auth/opsAuthService';

export function VerifyCode() {
  const auth = useOpsAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'expired'>('idle');
  const [error, setError] = useState('');

  if (auth.status === 'signed-in') {
    return <Navigate to="/ops" replace />;
  }

  // Reached by URL with no password step completed first — nothing to verify against.
  if (!opsAuthService.hasPendingLogin()) {
    return (
      <AuthShell eyebrow="Operator sign-in" title="Start over" description="There's no sign-in in progress to verify.">
        <Link to="/ops/login" className="text-sm font-semibold text-accent-deep hover:underline">
          Back to sign in
        </Link>
      </AuthShell>);

  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await auth.verifyCode(code);
      navigate('/ops', { replace: true });
    } catch (err) {
      if (err instanceof OpsAuthError && err.code === 'expired_code') {
        setStatus('expired');
        return;
      }
      setError(err instanceof OpsAuthError ? err.message : 'Something went wrong. Try again.');
      setStatus('error');
    }
  }

  if (status === 'expired') {
    return (
      <AuthShell eyebrow="Operator sign-in" title="That code expired" description="Sign in again for a fresh one.">
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-warn/40 bg-warn-soft px-3.5 py-3">
          <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
          <p className="text-xs leading-relaxed text-ink">One-time codes expire quickly. Start over to get a new one.</p>
        </div>
        <Link to="/ops/login" className="mt-3 inline-block text-xs font-semibold text-accent-deep hover:underline">
          Back to sign in
        </Link>
      </AuthShell>);

  }

  return (
    <AuthShell eyebrow="Operator sign-in · step 2 of 2" title="Enter your verification code" description="We sent a one-time code to your registered device.">
      <form className="space-y-3" onSubmit={onSubmit} noValidate>
        {status === 'error' && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
            <p className="text-xs leading-relaxed text-ink">{error}</p>
          </div>
        )}
        <label className="block">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">6-digit code</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-center font-mono text-lg tracking-[0.3em] text-ink placeholder:text-ink-mute focus:outline-none" />

        </label>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60">

          {status === 'submitting' && <RotateCcwIcon className="h-3.5 w-3.5 animate-spin" />}
          {status === 'submitting' ? 'Verifying…' : 'Verify and sign in'}
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-dashed border-line bg-shell px-3 py-2.5 text-2xs leading-relaxed text-ink-mute">
        <p className="font-semibold text-ink-soft">Design demo</p>
        <p>Code is {OPS_DEMO_CODE.valid}. Try {OPS_DEMO_CODE.expired} to see an expired code, or any other value for an invalid one.</p>
      </div>
    </AuthShell>);

}
