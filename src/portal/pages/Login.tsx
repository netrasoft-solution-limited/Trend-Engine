import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, RotateCcwIcon } from 'lucide-react';
import { AuthShell } from '../AuthShell';
import { usePortalAuth } from '../auth/PortalAuthContext';
import { PortalAuthError } from '../auth/authService';

export function Login() {
  const auth = usePortalAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState('');

  // Bookmarked or typed directly while already signed in — go straight in.
  // `RequirePortalSession` renders this component in place for a signed-out
  // visit at any URL, so this only fires for the literal /portal/login route.
  if (auth.status === 'signed-in' && location.pathname === '/portal/login') {
    return <Navigate to="/portal" replace />;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await auth.login(email, password);
      if (location.pathname === '/portal/login') {
        navigate('/portal', { replace: true });
      }
      // Otherwise this was rendered in place by the route guard at whatever
      // page the visitor originally asked for — it re-renders into that page
      // on its own now that `auth.status` is signed-in.
    } catch (err) {
      setError(err instanceof PortalAuthError ? err.message : 'Something went wrong. Try again.');
      setStatus('error');
    }
  }

  return (
    <AuthShell
      eyebrow="Client portal"
      title="Sign in"
      description="Read the outputs Pure Play has prepared for your organisation."
      footer={
        <>
          New here?{' '}
          <Link to="/portal/sign-up" className="font-semibold text-accent-deep hover:underline">
            Register your organisation
          </Link>
        </>
      }>

      <form className="space-y-3" onSubmit={onSubmit} noValidate>
        {status === 'error' && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
            <p className="text-xs leading-relaxed text-ink">{error}</p>
          </div>
        )}
        <label className="block">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Work email</span>
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
          {status === 'submitting' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-dashed border-line bg-shell px-3 py-2.5 text-2xs leading-relaxed text-ink-mute">
        <p className="font-semibold text-ink-soft">Demo accounts · password portal-demo-2026</p>
        <p>Org Admin — dana@jarrow.example</p>
        <p>Org Viewer — priya@jarrow.example</p>
        <p>Newly onboarded org, nothing published yet — jordan@newco.example</p>
      </div>
    </AuthShell>);

}
