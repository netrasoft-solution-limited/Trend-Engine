import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, api } from '../api';
import { AuthShell } from '../AuthShell';
import { Field, FormError, SubmitButton } from '../Field';

export function ResetPasswordConfirm() {
  const { uid = '', token = '' } = useParams();
  const navigate = useNavigate();
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
      await api.confirmPasswordReset(uid, token, password);
      navigate('/portal/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields ?? {});
        // Only show the banner when there is nothing to show inline, so the
        // message appears once rather than twice.
        if (!err.fields) setError(err.message);
      } else {
        setError('That did not work. Try requesting a new link.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Setting a new password signs you out everywhere else.">
      
      <form onSubmit={submit} noValidate>
        <FormError message={error} />
        <Field
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          errors={fields.password}
          autoComplete="new-password"
          autoFocus
          hint="At least 12 characters, and not something guessable." />
        
        <SubmitButton busy={busy}>Save and sign in</SubmitButton>
      </form>
      <Link
        to="/portal/reset-password"
        className="mt-4 block text-center text-xs font-semibold text-accent-deep hover:underline">
        
        Request a new link
      </Link>
    </AuthShell>);

}
