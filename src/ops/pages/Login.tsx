import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, RotateCcwIcon, ShieldIcon } from 'lucide-react';
import { AuthShell } from '../AuthShell';
import { useOpsAuth } from '../auth/OpsAuthContext';
import { OpsAuthError } from '../auth/opsAuthService';

export function Login() {
  const auth = useOpsAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState('');

  if (auth.status === 'signed-in' && location.pathname === '/ops/login') {
    return <Navigate to="/ops" replace />;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await auth.login(email, password);
      navigate('/ops/verify');
    } catch (err) {
      setError(err instanceof OpsAuthError ? err.message : 'Something went wrong. Try again.');
      setStatus('error');
    }
  }

  return (
    <AuthShell eyebrow="Operator sign-in" title="Sign in" description="Private access for Pure Play staff only.">
      <form className="space-y-3" onSubmit={onSubmit} noValidate>
        {status === 'error' && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
            <p className="text-xs leading-relaxed text-ink">{error}</p>
          </div>
        )}
        <label className="block">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />

        </label>
        <label className="block">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />

        </label>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60">

          {status === 'submitting' && <RotateCcwIcon className="h-3.5 w-3.5 animate-spin" />}
          {status === 'submitting' ? 'Checking…' : 'Continue'}
        </button>
      </form>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-shell px-3 py-2.5 text-2xs leading-relaxed text-ink-mute">
        <ShieldIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Access is by invitation from a platform admin. There is no self-serve sign-up for the operator tool.
      </p>

      <div className="mt-3 rounded-xl border border-dashed border-line bg-shell px-3 py-2.5 text-2xs leading-relaxed text-ink-mute">
        <p className="font-semibold text-ink-soft">Demo accounts · password ops-demo-2026</p>
        <p>Operator — abubakar@pureplay.example</p>
        <p>Platform Admin — mark@pureplay.example</p>
      </div>
    </AuthShell>);

}
