import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, RotateCcwIcon } from 'lucide-react';
import { ApiError, api } from '../api';
import { AuthShell } from '../AuthShell';
import { Field } from '../Field';

/**
 * Self-service registration of a NEW organisation.
 *
 * A recorded deviation from PRD §4.2, which specifies invite-only
 * provisioning. The endpoint 404s unless PORTAL_ALLOW_SELF_SIGNUP is set, and
 * it is off in production pending Mark's decision — so this screen is reachable
 * only where the deployment allows it.
 *
 * `RegisterView` creates the organisation, makes the registrant its admin and
 * SIGNS THEM IN, answering 201 with a session. There is no verification step:
 * the endpoints for one were removed and `test_registration.py` asserts they
 * 404. So this lands on the dashboard, not on a page asking them to check an
 * inbox nothing was sent to.
 */
export function SignUp() {
  const [organizationName, setOrganizationName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFields({});
    try {
      await api.register(organizationName, name, email, password);
      // Registered means signed in. A full reload lets PortalShell fetch the
      // session it now has, rather than threading one through the router.
      window.location.assign('/portal');
    } catch (err) {
      if (err instanceof ApiError) {
        // DRF returns a LIST per field, so a password failing three validators
        // shows all three at once instead of one per round trip.
        setFields(err.fields ?? {});
        setError(err.fields ? null : err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Register your organisation"
      subtitle="You will be its administrator, and signed in straight away."
      invitationOnly={false}>
      <form onSubmit={onSubmit} noValidate>
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
            <p className="text-xs leading-relaxed text-ink">{error}</p>
          </div>
        )}

        <Field
          label="Organisation name"
          value={organizationName}
          onChange={setOrganizationName}
          errors={fields.organization_name}
          autoComplete="organization"
          autoFocus
        />
        <Field
          label="Your full name"
          value={name}
          onChange={setName}
          errors={fields.name}
          autoComplete="name"
        />
        <Field
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          errors={fields.email}
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          errors={fields.password}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60">
          {submitting && <RotateCcwIcon className="h-3.5 w-3.5 animate-spin" />}
          {submitting ? 'Creating your organisation…' : 'Create organisation'}
        </button>

        <p className="mt-4 text-2xs leading-relaxed text-ink-mute">
          Already have an account?{' '}
          <Link to="/portal/login" className="font-semibold text-accent-deep hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
