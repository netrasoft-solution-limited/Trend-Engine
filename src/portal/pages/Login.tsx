import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, api } from '../api';
import { AuthShell } from '../AuthShell';
import { Field, FormError, SubmitButton } from '../Field';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.login(email, password);
      // Back to wherever they were headed before the redirect, if anywhere.
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from.startsWith('/portal') ? from : '/portal', { replace: true });
    } catch (err) {
      // The server returns one message for "no such account" and "wrong
      // password" on purpose — telling them apart would let anyone test
      // whether an address has access here.
      setError(err instanceof ApiError ? err.message : 'We could not sign you in. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Read the intelligence Pure Play prepares for you.">
      <form onSubmit={submit} noValidate>
        <FormError message={error} />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="username"
          autoFocus
          placeholder="you@yourcompany.com" />
        
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password" />
        
        <SubmitButton busy={busy}>Sign in</SubmitButton>
      </form>
      <p className="mt-4 text-center text-xs text-ink-soft">
        <Link to="/portal/reset-password" className="font-semibold text-accent-deep hover:underline">
          Forgot your password?
        </Link>
      </p>
    </AuthShell>);

}
