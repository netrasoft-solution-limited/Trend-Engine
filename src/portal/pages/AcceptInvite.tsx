import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, api } from '../api';
import { AuthShell } from '../AuthShell';
import { Field, FormError, SubmitButton } from '../Field';

/**
 * PRD §6.8: invite-based provisioning only. This is the ONLY route that
 * creates a portal account, and the token in the URL is the credential that
 * authorises it — single-use, time-limited, and stored server-side only as a
 * hash.
 */
export function AcceptInvite() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await api.acceptInvite(token, password, name);
      navigate('/portal/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields ?? {});
        if (!err.fields) setError(err.message);
      } else {
        setError('That invitation could not be accepted.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Accept your invitation"
      subtitle="Set a password and you'll be able to read what Pure Play publishes for your team.">
      
      <form onSubmit={submit} noValidate>
        <FormError message={error} />
        <Field
          label="Your name"
          value={name}
          onChange={setName}
          autoComplete="name"
          autoFocus
          placeholder="How your colleagues will see you" />
        
        <Field
          label="Choose a password"
          type="password"
          value={password}
          onChange={setPassword}
          errors={fields.password}
          autoComplete="new-password"
          hint="At least 12 characters, and not something guessable." />
        
        <SubmitButton busy={busy}>Create my account</SubmitButton>
      </form>
      <Link
        to="/portal/login"
        className="mt-4 block text-center text-xs font-semibold text-accent-deep hover:underline">
        
        Already have an account? Sign in
      </Link>
    </AuthShell>);

}
