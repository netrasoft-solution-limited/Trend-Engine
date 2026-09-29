import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangleIcon, MailIcon, RotateCcwIcon } from 'lucide-react';
import { AuthShell } from '../AuthShell';
import { getCsrfToken } from '../api/csrf';
import { resendVerification } from '../api/resendVerification';

export function CheckEmail() {
  const [params] = useSearchParams();
  const email = params.get('email');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendError, setResendError] = useState('');

  async function onResend() {
    if (!email) return;
    setResendStatus('sending');
    setResendError('');
    try {
      const { csrfToken } = await getCsrfToken();
      await resendVerification(email, csrfToken);
      setResendStatus('sent');
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setResendStatus('error');
    }
  }

  return (
    <AuthShell eyebrow="Almost there" title="Check your email" description="Open the verification link we sent to activate your organisation.">
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-xl border border-line bg-shell px-3.5 py-3">
          <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute" />
          <p className="text-xs leading-relaxed text-ink-soft">
            {email ? (
              <>
                We sent a verification link to <span className="font-semibold text-ink">{email}</span>.
              </>
            ) : (
              'We sent you a verification link.'
            )}{' '}
            It works once and expires after a few days.
          </p>
        </div>

        <button
          type="button"
          onClick={onResend}
          disabled={!email || resendStatus === 'sending'}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:text-ink-mute">

          {resendStatus === 'sending' && <RotateCcwIcon className="h-3.5 w-3.5 animate-spin" />}
          {resendStatus === 'sending' ? 'Sending…' : resendStatus === 'sent' ? 'Sent again' : 'Resend email'}
        </button>

        {resendStatus === 'error' && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
            <p className="text-xs leading-relaxed text-ink">{resendError}</p>
          </div>
        )}

        <p className="text-center text-xs text-ink-soft">
          Wrong address?{' '}
          <Link to="/portal/sign-up" className="font-semibold text-accent-deep hover:underline">
            Start again
          </Link>
        </p>
      </div>
    </AuthShell>);

}
