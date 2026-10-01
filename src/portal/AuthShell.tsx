import { ZapIcon } from 'lucide-react';

/**
 * Chrome for the screens that exist BEFORE there is a session: sign in, accept
 * an invitation, reset a password.
 *
 * A separate shell rather than a branch inside PortalShell, because these
 * screens must render with no session at all. Sharing a shell with the
 * authenticated views would mean one component that sometimes has a tenant
 * bound and sometimes does not — which is precisely the ambiguity the rest of
 * this system is built to avoid.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  /**
   * PRD §4.2 makes provisioning invite-only, and the note below says so. Self
   * -service registration is a recorded deviation, off in production — so the
   * one screen that offers it turns the note off rather than contradicting
   * itself directly above its own form.
   */
  invitationOnly = true
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  invitationOnly?: boolean;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink">
            <ZapIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-ink">Trend Engine</p>
            <p className="text-2xs text-ink-mute">Category intelligence from Pure Play</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 shadow-panel">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>

        {invitationOnly && (
          <p className="mt-5 text-2xs leading-relaxed text-ink-mute">
            Accounts are created by invitation. There is no public sign-up — if you need access, ask
            your organisation's administrator or your Pure Play contact.
          </p>
        )}
      </main>
    </div>);

}
