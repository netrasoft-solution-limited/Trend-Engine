import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, RotateCcwIcon } from 'lucide-react';
import { AuthShell } from '../AuthShell';
import { portalAuthService } from '../auth/authService';

const EMPTY_FORM = { organizationName: '', fullName: '', email: '', password: '' };

export function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
    };
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    try {
      const result = await portalAuthService.signUp(form);
      navigate(`/portal/check-email?email=${encodeURIComponent(result.email)}`);
    } catch {
      // The mock never actually throws here, but a real endpoint could
      // (network failure, validation) — the error state exists for that.
      setStatus('error');
    }
  }

  return (
    <AuthShell
      eyebrow="Client portal"
      title="Register your organisation"
      description="Creates your organisation and signs you in as its first Org Admin once you verify your email."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/portal/login" className="font-semibold text-accent-deep hover:underline">
            Sign in
          </Link>
        </>
      }>

      <form className="space-y-3" onSubmit={onSubmit} noValidate>
        {status === 'error' && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
            <p className="text-xs leading-relaxed text-ink">Something went wrong. Try again.</p>
          </div>
        )}
        <label className="block">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Organisation name</span>
          <input required {...field('organizationName')} className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Your full name</span>
          <input required {...field('fullName')} className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Work email</span>
          <input type="email" required {...field('email')} className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Password</span>
          <input type="password" required minLength={8} {...field('password')} className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />
        </label>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60">

          {status === 'submitting' && <RotateCcwIcon className="h-3.5 w-3.5 animate-spin" />}
          {status === 'submitting' ? 'Creating your organisation…' : 'Create organisation'}
        </button>
        <p className="text-2xs leading-relaxed text-ink-mute">
          You’ll be asked to verify your email before your organisation goes live. If this address already has an
          account, you’ll see the same next screen either way.
        </p>
      </form>
    </AuthShell>);

}
