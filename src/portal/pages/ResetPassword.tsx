import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { AuthShell } from '../AuthShell';
import { Field, SubmitButton } from '../Field';

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.requestPasswordReset(email);
    } finally {
      // Always report the same thing, whether or not the address has an
      // account. The server does the same — anything else is an oracle for
      // which addresses have portal access.
      setSent(true);
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <p className="text-sm leading-relaxed text-ink-soft">
          If <span className="font-semibold text-ink">{email}</span> has an account, a reset link is
          on its way. It expires shortly, so use it soon.
        </p>
        <Link
          to="/portal/login"
          className="mt-5 block text-center text-xs font-semibold text-accent-deep hover:underline">
          
          Back to sign in
        </Link>
      </AuthShell>);

  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new one.">
      
      <form onSubmit={submit} noValidate>
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="username"
          autoFocus />
        
        <SubmitButton busy={busy}>Send the link</SubmitButton>
      </form>
      <Link
        to="/portal/login"
        className="mt-4 block text-center text-xs font-semibold text-accent-deep hover:underline">
        
        Back to sign in
      </Link>
    </AuthShell>);

}
